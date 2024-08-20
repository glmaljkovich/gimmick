import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/router";

export function WelcomeScreen() {
  const router = useRouter();
  const path = router.pathname;
  const animate = path === "/ask";
  return (
    <div className="flex flex-col items-center justify-center h-3/4 mt-10">
      <div className="flex gap-4 overflow-x-hidden text-nowrap text-4xl font-thin items-center text-white text-left">
        <AnimatePresence>
          <motion.div
            key="img"
            viewport={{ once: true }}
            initial={{ opacity: animate ? 0 : 1 }}
            transition={{ duration: 0.5 }}
            animate={{ opacity: 1 }}
            className=""
            layout
            layoutId={animate ? "gimmick" : "img"}
          >
            <Image
              className="rounded-full w-16 h-16"
              src="/images/clippy.webp"
              alt="Logo image"
              width={64}
              height={64}
            />
          </motion.div>
          <motion.div
            initial={{
              opacity: animate ? 0 : 1,
              width: animate ? "64px" : "auto",
            }}
            key="text"
            transition={{ duration: 1 }}
            animate={{ opacity: 1, width: "auto" }}
            viewport={{ once: true }}
          >
            How can I help you?
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
