import classNames from "classnames";
import { motion, RepeatType } from "framer-motion";

type GradientBlobProps = {
  from?: string;
  via?: string;
  to?: string;
  stops?: string;
  size?: string;
  direction?: string;
  classNames?: string;
  top?: boolean;
  left?: boolean;
  right?: boolean;
  bottom?: boolean;
};

/**
 * Spinning circle that oscilates and grows slightly
 */
export function GradientBlob(props: GradientBlobProps) {
  const gradient = {
    from: props.from ? `${props.from}` : "from-pink-500",
    via: props.via ? `${props.via}` : "via-red-500",
    to: props.to ? `${props.to}` : "to-yellow-500",
    direction: props.direction || "r",
  };

  const blob = {
    height: props.size || "64px",
    width: props.size || "64px",
  };

  const positions = {
    "top-0": props.top,
    "left-0": props.left,
    "right-0": props.right,
    "bottom-0": props.bottom,
  };

  const classes = classNames(
    "absolute blur-2xl rounded-full",
    `bg-gradient-to-r`,
    gradient.from,
    gradient.via,
    gradient.to,
    positions,
    props.classNames,
  );

  const blobVariants = {
    animate: {
      scale: [0.8, 1.2, 0.8],
      x: [0, 20, 0],
      y: [0, -20, 0],
      rotate: [0, 180, 360],
      height: blob.height,
      width: blob.width,
      transition: {
        duration: 10,
        ease: "easeInOut",
        repeat: Infinity,
        repeatType: "loop" as RepeatType,
      },
    },
  };

  return (
    <motion.div
      className={classes}
      style={{ height: blob.height, width: blob.width }}
      variants={blobVariants}
      animate="animate"
    />
  );
}
