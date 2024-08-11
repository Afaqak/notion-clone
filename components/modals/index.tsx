import { useRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import useOnClickOutside from "@/hooks/use-outside-click";
import useModalStore from "@/store/modal-store";

function Modal({
  children,
  isOpen,
  selector = "my-portal",
  className = "",
}: {
  children: React.ReactNode;
  isOpen: boolean;
  selector?: string;
  className?: string;
}) {
  const ref = useRef(null);
  const { setTypeAndData } = useModalStore();
  // const ref = useRef<Element | null>();

  // useEffect(() => {
  //   ref.current = document.getElementById(selector);
  // }, [selector]);

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const modalVariants = {
    hidden: { opacity: 0, y: "-100vh" },
    visible: { opacity: 1, y: "0" },
  };

  if (!isOpen) return null;

  useOnClickOutside(ref, () => setTypeAndData(""));

  return (
    <motion.div
      className="fixed inset-0 h-full w-full flex items-center justify-center z-[999999] bg-black bg-opacity-10"
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={overlayVariants}
    >
      <motion.div
        ref={ref}
        className={cn(
          "max-w-[425px] bg-white w-full rounded-md p-4 shadow",
          className
        )}
        initial="hidden"
        animate="visible"
        exit="hidden"
        variants={modalVariants}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

export default Modal;
