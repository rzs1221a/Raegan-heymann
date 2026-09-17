import {
  forwardRef,
  useImperativeHandle,
  type ElementType,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { useSurfaceMotion, type RenderMotionVariant } from "../lib/renderMotion";

type MotionSurfaceProps = HTMLAttributes<HTMLElement> & {
  as?: ElementType;
  children?: ReactNode;
  variant?: RenderMotionVariant;
};

const MotionSurface = forwardRef<HTMLElement, MotionSurfaceProps>(
  function MotionSurface(
    {
      as,
      children,
      className = "",
      variant = "surface",
      ...props
    },
    forwardedRef
  ) {
    const localRef = useSurfaceMotion<HTMLElement>([], variant);
    useImperativeHandle(forwardedRef, () => localRef.current as HTMLElement, [
      localRef,
    ]);
    const Tag = (as ?? "div") as ElementType;
    return (
      <Tag
        ref={localRef}
        className={className}
        data-motion-surface={variant}
        {...props}
      >
        {children}
      </Tag>
    );
  }
);

export default MotionSurface;
