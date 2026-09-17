export interface Testimonial {
  quote: string;
  name: string;
  context?: string;
}

/**
 * Real client words only. Ships empty on purpose — the section renders
 * nothing until Raegan supplies testimonials she has permission to publish.
 */
export const testimonials: Testimonial[] = [];
