import { useState, useCallback, useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface MediaItem {
    type: 'image' | 'video' | 'screenshot';
    url: string;
    thumbnail?: string;
    caption?: string;
}

interface MediaGalleryProps {
    items: MediaItem[];
    title?: string;
    description?: string;
}

export function MediaGallery({ items, title = 'Media Gallery', description }: MediaGalleryProps) {
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    const scrollPrev = useCallback(() => {
        if (emblaApi) emblaApi.scrollPrev();
    }, [emblaApi]);

    const scrollNext = useCallback(() => {
        if (emblaApi) emblaApi.scrollNext();
    }, [emblaApi]);

    const onSelect = useCallback(() => {
        if (!emblaApi) return;
        setSelectedIndex(emblaApi.selectedScrollSnap());
    }, [emblaApi]);

    // Set up listeners
    useEffect(() => {
        if (!emblaApi) return;
        onSelect();
        emblaApi.on('select', onSelect);
        emblaApi.on('reInit', onSelect);
    }, [emblaApi, onSelect]);

    const openLightbox = (index: number) => {
        setLightboxIndex(index);
        setLightboxOpen(true);
    };

    if (!items || items.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>{title}</CardTitle>
                    {description && <CardDescription>{description}</CardDescription>}
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground text-center py-8">No media available</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>{title}</CardTitle>
                    {description && <CardDescription>{description}</CardDescription>}
                </CardHeader>
                <CardContent>
                    {/* Main Carousel */}
                    <div className="relative">
                        <div className="overflow-hidden" ref={emblaRef}>
                            <div className="flex">
                                {items.map((item, index) => (
                                    <div
                                        key={index}
                                        className="flex-[0_0_100%] min-w-0 relative group cursor-pointer"
                                        onClick={() => openLightbox(index)}
                                    >
                                        {item.type === 'video' ? (
                                            <video
                                                src={item.url}
                                                className="w-full h-[400px] object-cover rounded-lg"
                                                controls
                                                poster={item.thumbnail}
                                            />
                                        ) : (
                                            <div className="relative">
                                                <img
                                                    src={item.url}
                                                    alt={item.caption || `Media ${index + 1}`}
                                                    className="w-full h-[400px] object-cover rounded-lg"
                                                    loading="lazy"
                                                />
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                    <Maximize2 className="w-12 h-12 text-white" />
                                                </div>
                                            </div>
                                        )}
                                        {item.caption && (
                                            <p className="text-sm text-muted-foreground text-center mt-2">
                                                {item.caption}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Navigation Buttons */}
                        {items.length > 1 && (
                            <>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm"
                                    onClick={scrollPrev}
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm"
                                    onClick={scrollNext}
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </>
                        )}
                    </div>

                    {/* Thumbnail Navigation */}
                    {items.length > 1 && (
                        <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                            {items.map((item, index) => (
                                <button
                                    key={index}
                                    onClick={() => emblaApi?.scrollTo(index)}
                                    className={cn(
                                        'flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-all',
                                        selectedIndex === index
                                            ? 'border-primary'
                                            : 'border-transparent opacity-60 hover:opacity-100'
                                    )}
                                >
                                    <img
                                        src={item.thumbnail || item.url}
                                        alt={`Thumbnail ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Lightbox Dialog */}
            <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
                <DialogContent className="max-w-7xl w-full h-[90vh] p-0">
                    <div className="relative w-full h-full flex items-center justify-center bg-black">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-4 right-4 z-50 text-white hover:bg-white/20"
                            onClick={() => setLightboxOpen(false)}
                        >
                            <X className="w-6 h-6" />
                        </Button>

                        {items[lightboxIndex].type === 'video' ? (
                            <video
                                src={items[lightboxIndex].url}
                                className="max-w-full max-h-full"
                                controls
                                autoPlay
                            />
                        ) : (
                            <img
                                src={items[lightboxIndex].url}
                                alt={items[lightboxIndex].caption || `Media ${lightboxIndex + 1}`}
                                className="max-w-full max-h-full object-contain"
                            />
                        )}

                        {items.length > 1 && (
                            <>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
                                    onClick={() => setLightboxIndex((lightboxIndex - 1 + items.length) % items.length)}
                                >
                                    <ChevronLeft className="w-8 h-8" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
                                    onClick={() => setLightboxIndex((lightboxIndex + 1) % items.length)}
                                >
                                    <ChevronRight className="w-8 h-8" />
                                </Button>
                            </>
                        )}

                        {items[lightboxIndex].caption && (
                            <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-white p-4 text-center">
                                {items[lightboxIndex].caption}
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
