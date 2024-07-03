import classNames from "classnames";
import { motion, RepeatType } from "framer-motion";
import { twMerge } from "tailwind-merge";
import "./gradient.css";
export function GradientBar({ className }) {
  return (
    <div
      className={twMerge(
        "gradient absolute blur-3xl bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500",
        className,
      )}
    />
  );
}

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
    "absolute blur-3xl filter rounded-full",
    `bg-gradient-to-r`,
    gradient.from,
    gradient.via,
    gradient.to,
    positions,
    props.classNames,
  );

  const blobVariants = {
    animate: {
      x: ["-50%", "-40%", "-50%"],
      y: ["-50%", "-40%", "-50%"],
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
