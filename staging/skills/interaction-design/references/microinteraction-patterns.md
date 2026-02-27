# Microinteraction Patterns Reference

## Button States

### Loading Button

```tsx
import { motion, AnimatePresence } from "framer-motion";

interface LoadingButtonProps {
  isLoading: boolean;
  children: React.ReactNode;
  onClick: () => void;
}

function LoadingButton({ isLoading, children, onClick }: LoadingButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className="relative px-4 py-2 bg-blue-600 text-white rounded-lg overflow-hidden"
    >
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.span
            key="loading"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2"
          >
            <Spinner className="w-4 h-4" />
            Processing...
          </motion.span>
        ) : (
          <motion.span
            key="idle"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {children}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}

// Spinner component
function Spinner({ className }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24">
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
        fill="none"
        strokeDasharray="62.83"
        strokeDashoffset="15"
        strokeLinecap="round"
      />
    </svg>
  );
}
```

### Success/Error State

```tsx
function SubmitButton({ onSubmit }: { onSubmit: () => Promise<void> }) {
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );

  const handleClick = async () => {
    setState("loading");
    try {
      await onSubmit();
      setState("success");
      setTimeout(() => setState("idle"), 2000);
    } catch {
      setState("error");
      setTimeout(() => setState("idle"), 2000);
    }
  };

  const icons = {
    idle: null,
    loading: <Spinner className="w-5 h-5" />,
    success: <CheckIcon className="w-5 h-5" />,
    error: <XIcon className="w-5 h-5" />,
  };

  const colors = {
    idle: "bg-blue-600 hover:bg-blue-700",
    loading: "bg-blue-600",
    success: "bg-green-600",
    error: "bg-red-600",
  };

  return (
    <motion.button
      onClick={handleClick}
      disabled={state === "loading"}
      className={`flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors ${colors[state]}`}
      animate={{
        scale: state === "success" || state === "error" ? [1, 1.05, 1] : 1,
      }}
    >
      <AnimatePresence mode="wait">
        {icons[state] && (
          <motion.span
            key={state}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
          >
            {icons[state]}
          </motion.span>
        )}
      </AnimatePresence>
      {state === "idle" && "Submit"}
      {state === "loading" && "Submitting..."}
      {state === "success" && "Done!"}
      {state === "error" && "Failed"}
    </motion.button>
  );
}
```

## Form Interactions

### Floating Label Input

```tsx
import { useState, useId } from "react";

function FloatingInput({
  label,
  type = "text",
}: {
  label: string;
  type?: string;
}) {
  const [value, setValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const id = useId();

  const isFloating = isFocused || value.length > 0;

  return (
    <div className="relative">
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="peer w-full px-4 py-3 border rounded-lg outline-none transition-colors
          focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
      />
      <label
        htmlFor={id}
        className={`absolute left-4 transition-all duration-200 pointer-events-none
          ${
            isFloating
              ? "top-0 -translate-y-1/2 text-xs bg-white px-1 text-blue-600"
              : "top-1/2 -translate-y-1/2 text-gray-500"
          }`}
      >
        {label}
      </label>
    </div>
  );
}
```

### Shake on Error

```tsx
import { motion, useAnimation } from "framer-motion";

function ShakeInput({ error, ...props }: InputProps & { error?: string }) {
  const controls = useAnimation();

  useEffect(() => {
    if (error) {
      controls.start({
        x: [0, -10, 10, -10, 10, 0],
        transition: { duration: 0.4 },
      });
    }
  }, [error, controls]);

  return (
    <motion.div animate={controls}>
      <input
        {...props}
        className={`w-full px-4 py-2 border rounded-lg ${
          error ? "border-red-500" : "border-gray-300"
        }`}
      />
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1 text-sm text-red-500"
        >
          {error}
        </motion.p>
      )}
    </motion.div>
  );
}
```

### Character Count

```tsx
function TextareaWithCount({ maxLength = 280 }: { maxLength?: number }) {
  const [value, setValue] = useState("");
  const remaining = maxLength - value.length;
  const isNearLimit = remaining <= 20;
  const isOverLimit = remaining < 0;

  return (
    <div className="relative">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full px-4 py-3 border rounded-lg resize-none"
        rows={4}
      />
      <motion.span
        className={`absolute bottom-2 right-2 text-sm ${
          isOverLimit
            ? "text-red-500"
            : isNearLimit
              ? "text-yellow-500"
              : "text-gray-400"
        }`}
        animate={{ scale: isNearLimit ? [1, 1.1, 1] : 1 }}
        transition={{ duration: 0.2 }}
      >
        {remaining}
      </motion.span>
    </div>
  );
}
```

## Feedback Patterns

### Toast Notifications

```tsx
import { motion, AnimatePresence } from "framer-motion";
import { createContext, useContext, useState, useCallback } from "react";

interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

const ToastContext = createContext<{
  addToast: (message: string, type: Toast["type"]) => void;
} | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: Toast["type"]) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-4 right-4 space-y-2 z-50">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.95 }}
              className={`px-4 py-3 rounded-lg shadow-lg ${
                toast.type === "success"
                  ? "bg-green-600"
                  : toast.type === "error"
                    ? "bg-red-600"
                    : "bg-blue-600"
              } text-white`}
            >
              {toast.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be within ToastProvider");
  return context;
}
```

### Confirmation Dialog

```tsx
function ConfirmButton({
  onConfirm,
  confirmText = "Click again to confirm",
  children,
}: {
  onConfirm: () => void;
  confirmText?: string;
  children: React.ReactNode;
}) {
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    if (isPending) {
      const timer = setTimeout(() => setIsPending(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isPending]);

  const handleClick = () => {
    if (isPending) {
      onConfirm();
      setIsPending(false);
    } else {
      setIsPending(true);
    }
  };

  return (
    <motion.button
      onClick={handleClick}
      className={`px-4 py-2 rounded-lg transition-colors ${
        isPending ? "bg-red-600 text-white" : "bg-gray-200 text-gray-800"
      }`}
      animate={{ scale: isPending ? [1, 1.02, 1] : 1 }}
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={isPending ? "confirm" : "idle"}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          {isPending ? confirmText : children}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}
```

## Navigation Patterns

### Active Link Indicator

```tsx
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

function Navigation({ items }: { items: { href: string; label: string }[] }) {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 p-1 bg-gray-100 rounded-lg">
      {items.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`relative px-4 py-2 text-sm font-medium ${
              isActive ? "text-white" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="activeNav"
                className="absolute inset-0 bg-blue-600 rounded-md"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
            <span className="relative z-10">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
```

### Hamburger Menu Icon

```tsx
function MenuIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <button className="relative w-6 h-6" aria-label="Toggle menu">
      <motion.span
        className="absolute left-0 h-0.5 w-6 bg-current"
        animate={{
          top: isOpen ? "50%" : "25%",
          rotate: isOpen ? 45 : 0,
          translateY: isOpen ? "-50%" : 0,
        }}
        transition={{ duration: 0.2 }}
      />
      <motion.span
        className="absolute left-0 top-1/2 h-0.5 w-6 bg-current -translate-y-1/2"
        animate={{ opacity: isOpen ? 0 : 1, scaleX: isOpen ? 0 : 1 }}
        transition={{ duration: 0.2 }}
      />
      <motion.span
        className="absolute left-0 h-0.5 w-6 bg-current"
        animate={{
          bottom: isOpen ? "50%" : "25%",
          rotate: isOpen ? -45 : 0,
          translateY: isOpen ? "50%" : 0,
        }}
        transition={{ duration: 0.2 }}
      />
    </button>
  );
}
```

## Data Interactions

### Optimistic Updates

```tsx
function LikeButton({ postId, initialLiked, initialCount }) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);

  const handleLike = async () => {
    // Optimistic update
    const newLiked = !liked;
    setLiked(newLiked);
    setCount((c) => c + (newLiked ? 1 : -1));

    try {
      await api.toggleLike(postId);
    } catch {
      // Rollback on error
      setLiked(!newLiked);
      setCount((c) => c + (newLiked ? -1 : 1));
    }
  };

  return (
    <motion.button
      onClick={handleLike}
      whileTap={{ scale: 0.9 }}
      className={`flex items-center gap-2 ${liked ? "text-red-500" : "text-gray-500"}`}
    >
      <motion.span
        animate={{ scale: liked ? [1, 1.3, 1] : 1 }}
        transition={{ duration: 0.3 }}
      >
        {liked ? <HeartFilledIcon /> : <HeartIcon />}
      </motion.span>
      <AnimatePresence mode="wait">
        <motion.span
          key={count}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
        >
          {count}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}
```

### Pull to Refresh

```tsx
import { motion, useMotionValue, useTransform } from "framer-motion";

function PullToRefresh({ onRefresh, children }) {
  const y = useMotionValue(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const opacity = useTransform(y, [0, 60], [0, 1]);
  const rotate = useTransform(y, [0, 60], [0, 180]);

  const handleDragEnd = async (_, info) => {
    if (info.offset.y > 60 && !isRefreshing) {
      setIsRefreshing(true);
      await onRefresh();
      setIsRefreshing(false);
    }
  };

  return (
    <div className="overflow-hidden">
      <motion.div style={{ opacity }} className="flex justify-center py-4">
        <motion.div style={{ rotate }}>
          {isRefreshing ? <Spinner /> : <ArrowDownIcon />}
        </motion.div>
      </motion.div>
      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0.5, bottom: 0 }}
        style={{ y }}
        onDragEnd={handleDragEnd}
      >
        {children}
      </motion.div>
    </div>
  );
}
```
