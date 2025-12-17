import { useState, useEffect, useCallback } from "react";
import { Project } from "@/lib/types";

// Vote types: 1 = upvote, -1 = downvote, 0 = neutral
export type VoteType = 1 | -1 | 0;

interface VoteData {
  upvotes: number;
  downvotes: number;
}

interface UserVotes {
  [projectName: string]: VoteType;
}

interface GlobalVotes {
  [projectName: string]: VoteData;
}

const USER_VOTES_KEY = "cortex_user_votes";
const GLOBAL_VOTES_KEY = "cortex_global_votes";

/**
 * Hook to manage voting functionality for projects
 * Uses localStorage for client-side persistence
 */
export function useVoting(projects: Project[]) {
  const [userVotes, setUserVotes] = useState<UserVotes>({});
  const [globalVotes, setGlobalVotes] = useState<GlobalVotes>({});

  // Load votes from localStorage on mount
  useEffect(() => {
    const loadVotes = () => {
      try {
        const storedUserVotes = localStorage.getItem(USER_VOTES_KEY);
        const storedGlobalVotes = localStorage.getItem(GLOBAL_VOTES_KEY);

        if (storedUserVotes) {
          setUserVotes(JSON.parse(storedUserVotes));
        }

        if (storedGlobalVotes) {
          setGlobalVotes(JSON.parse(storedGlobalVotes));
        } else {
          // Initialize global votes from projects data
          const initialGlobalVotes: GlobalVotes = {};
          projects.forEach((project) => {
            initialGlobalVotes[project.name] = {
              upvotes: project.upvotes || 0,
              downvotes: project.downvotes || 0,
            };
          });
          setGlobalVotes(initialGlobalVotes);
          localStorage.setItem(GLOBAL_VOTES_KEY, JSON.stringify(initialGlobalVotes));
        }
      } catch (error) {
        console.error("Failed to load votes from localStorage:", error);
      }
    };

    loadVotes();
  }, [projects]);

  // Save votes to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(USER_VOTES_KEY, JSON.stringify(userVotes));
    } catch (error) {
      console.error("Failed to save user votes:", error);
    }
  }, [userVotes]);

  useEffect(() => {
    try {
      localStorage.setItem(GLOBAL_VOTES_KEY, JSON.stringify(globalVotes));
    } catch (error) {
      console.error("Failed to save global votes:", error);
    }
  }, [globalVotes]);

  /**
   * Get the current user's vote for a project
   */
  const getUserVote = useCallback(
    (projectName: string): VoteType => {
      return userVotes[projectName] || 0;
    },
    [userVotes]
  );

  /**
   * Get vote counts for a project
   */
  const getVoteCounts = useCallback(
    (projectName: string): VoteData => {
      return (
        globalVotes[projectName] || {
          upvotes: 0,
          downvotes: 0,
        }
      );
    },
    [globalVotes]
  );

  /**
   * Get net score (upvotes - downvotes) for a project
   */
  const getNetScore = useCallback(
    (projectName: string): number => {
      const counts = getVoteCounts(projectName);
      return counts.upvotes - counts.downvotes;
    },
    [getVoteCounts]
  );

  /**
   * Cast a vote for a project
   * Reddit-style: user can upvote, downvote, or remove their vote
   */
  const vote = useCallback(
    (projectName: string, voteType: VoteType) => {
      const currentVote = getUserVote(projectName);
      const currentCounts = getVoteCounts(projectName);

      // If clicking the same vote type, remove the vote (toggle off)
      if (currentVote === voteType) {
        // Remove the vote
        setUserVotes((prev) => {
          const updated = { ...prev };
          delete updated[projectName];
          return updated;
        });

        // Update global counts
        setGlobalVotes((prev) => {
          const updated = { ...prev };
          if (voteType === 1) {
            updated[projectName] = {
              ...currentCounts,
              upvotes: Math.max(0, currentCounts.upvotes - 1),
            };
          } else if (voteType === -1) {
            updated[projectName] = {
              ...currentCounts,
              downvotes: Math.max(0, currentCounts.downvotes - 1),
            };
          }
          return updated;
        });
      } else {
        // Change vote or cast new vote
        setUserVotes((prev) => ({
          ...prev,
          [projectName]: voteType,
        }));

        // Update global counts
        setGlobalVotes((prev) => {
          const updated = { ...prev };
          let newUpvotes = currentCounts.upvotes;
          let newDownvotes = currentCounts.downvotes;

          // Remove previous vote if exists
          if (currentVote === 1) {
            newUpvotes = Math.max(0, newUpvotes - 1);
          } else if (currentVote === -1) {
            newDownvotes = Math.max(0, newDownvotes - 1);
          }

          // Add new vote
          if (voteType === 1) {
            newUpvotes += 1;
          } else if (voteType === -1) {
            newDownvotes += 1;
          }

          updated[projectName] = {
            upvotes: newUpvotes,
            downvotes: newDownvotes,
          };

          return updated;
        });
      }
    },
    [getUserVote, getVoteCounts]
  );

  /**
   * Clear all votes (for testing/debugging)
   */
  const clearAllVotes = useCallback(() => {
    setUserVotes({});
    const initialGlobalVotes: GlobalVotes = {};
    projects.forEach((project) => {
      initialGlobalVotes[project.name] = {
        upvotes: project.upvotes || 0,
        downvotes: project.downvotes || 0,
      };
    });
    setGlobalVotes(initialGlobalVotes);
    localStorage.removeItem(USER_VOTES_KEY);
    localStorage.removeItem(GLOBAL_VOTES_KEY);
  }, [projects]);

  return {
    vote,
    getUserVote,
    getVoteCounts,
    getNetScore,
    clearAllVotes,
  };
}

/**
 * Utility function to calculate controversy score
 * Higher score = more controversial (similar upvotes and downvotes)
 */
export function getControveryScore(upvotes: number, downvotes: number): number {
  const total = upvotes + downvotes;
  if (total === 0) return 0;

  const balance = Math.min(upvotes, downvotes);
  return balance * total;
}

/**
 * Utility function to calculate hot score (Reddit-style)
 * Balances score and recency
 */
export function getHotScore(netScore: number, dateStr: string): number {
  const date = new Date(dateStr);
  const now = new Date();
  const ageInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

  // Decay factor: score decreases over time
  const decay = Math.pow(ageInHours + 2, 1.5);
  return netScore / decay;
}
