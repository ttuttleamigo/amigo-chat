import * as React from "react";
import Image from "next/image"; // Added for Bot Avatar
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
// Avatar components from ui/avatar are not used for the bot message avatar directly here anymore
// import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"; 
import MessageLoading from "./message-loading";
import { Button } from "../button"; // Removed ButtonProps import

// ChatBubble
const chatBubbleVariant = cva(
  "flex gap-2 max-w-[60%]", // items-end and relative group moved or adjusted based on variant
  {
    variants: {
      variant: {
        received: "self-start flex-col items-start", // Avatar above bubble
        sent: "self-end flex-row-reverse items-end relative group", // User messages keep existing flex for actions
      },
      layout: {
        default: "",
        ai: "max-w-full w-full items-center",
      },
    },
    defaultVariants: {
      variant: "received",
      layout: "default",
    },
  },
);

interface ChatBubbleProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof chatBubbleVariant> {
  avatarSrc?: string;
  showActivityIndicator?: boolean;
}

const ChatBubble = React.forwardRef<HTMLDivElement, ChatBubbleProps>(
  ({ className, variant, layout, children, avatarSrc, showActivityIndicator, ...props }, ref) => (
    <div
      className={cn(
        chatBubbleVariant({ variant, layout, className }),
        variant === "received" ? "" : "relative group" // Only add relative group for sent if actions are used
      )}
      ref={ref}
      {...props}
    >
      {variant === "received" && avatarSrc && (
        <div className="flex items-center gap-2 mb-1 self-start border-0 outline-none"> {/* Container for avatar and name */}
          <div className="relative w-8 h-8 flex-shrink-0"> 
            <Image
              src={avatarSrc}
              alt="Bot Avatar"
              width={32}
              height={32}
              className="rounded-full" // Removed bg-white p-0.5
            />
            {showActivityIndicator && (
              <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white" />
            )}
          </div>
          <span className="text-xs font-medium text-slate-700 dark:text-slate-300 font-montserrat">Amigo Virtual Assistant</span>
        </div>
      )}
      {/* Children (ChatBubbleMessage) will now naturally flow below for received variant */}
      {React.Children.map(children, (child) =>
        React.isValidElement(child) && typeof child.type !== "string" 
          ? React.cloneElement(child as React.ReactElement<{ variant?: "received" | "sent" }>, { variant: variant === null ? undefined : variant }) 
          : child
      )}
    </div>
  ),
);
ChatBubble.displayName = "ChatBubble";

// ChatBubbleAvatar - This component might not be directly used by ChatPage anymore if avatar logic is in ChatBubble
// Keeping it for potential direct use elsewhere or if ChatBubble's children structure changes.
interface ChatBubbleAvatarProps {
  src?: string;
  fallback?: string;
  className?: string;
}

const ChatBubbleAvatar: React.FC<ChatBubbleAvatarProps> = ({ // This is a generic Avatar, not the one with activity indicator
  src,
  fallback,
  className,
}) => (
  // Using shadcn Avatar for consistency if this component is used directly
  <div className={cn("relative w-8 h-8", className)}>
    <Image
      src={src || "/default-avatar.png"} // Provide a default if src is undefined
      alt={fallback || "Avatar"}
      width={32}
      height={32}
      className="rounded-full"
    />
  </div>
);


// ChatBubbleMessage
const chatBubbleMessageVariants = cva("p-4 rounded-xl", { // Changed to rounded-xl for all
  variants: {
    variant: {
      received:
        "bg-secondary text-secondary-foreground", // Specific corner rounding removed, handled by rounded-xl
      sent: "bg-primary text-primary-foreground", // Specific corner rounding removed, handled by rounded-xl
    },
    layout: {
      default: "",
      ai: "border-t w-full rounded-none bg-transparent",
    },
  },
  defaultVariants: {
    variant: "received",
    layout: "default",
  },
});

interface ChatBubbleMessageProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof chatBubbleMessageVariants> {
  isLoading?: boolean;
}

const ChatBubbleMessage = React.forwardRef<
  HTMLDivElement,
  ChatBubbleMessageProps
>(
  (
    { className, variant, layout, isLoading = false, children, ...props },
    ref,
  ) => (
    <div
      className={cn(
        chatBubbleMessageVariants({ variant, layout, className }),
        "break-words max-w-full whitespace-pre-wrap border-0 outline-none",
      )}
      ref={ref}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center space-x-2">
          <MessageLoading />
        </div>
      ) : (
        children
      )}
    </div>
  ),
);
ChatBubbleMessage.displayName = "ChatBubbleMessage";

// ChatBubbleTimestamp
interface ChatBubbleTimestampProps
  extends React.HTMLAttributes<HTMLDivElement> {
  timestamp: string;
}

const ChatBubbleTimestamp: React.FC<ChatBubbleTimestampProps> = ({
  timestamp,
  className,
  ...props
}) => (
  <div className={cn("text-xs mt-2 text-right", className)} {...props}>
    {timestamp}
  </div>
);

// ChatBubbleAction
type ChatBubbleActionProps = React.ComponentProps<typeof Button> & { // Changed ButtonProps to React.ComponentProps<typeof Button>
  icon: React.ReactNode;
};

const ChatBubbleAction: React.FC<ChatBubbleActionProps> = ({
  icon,
  onClick,
  className,
  variant = "ghost",
  size = "icon",
  ...props
}) => (
  <Button
    variant={variant}
    size={size}
    className={className}
    onClick={onClick}
    {...props}
  >
    {icon}
  </Button>
);

interface ChatBubbleActionWrapperProps
  extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "sent" | "received";
  className?: string;
}

const ChatBubbleActionWrapper = React.forwardRef<
  HTMLDivElement,
  ChatBubbleActionWrapperProps
>(({ variant, className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "absolute top-1/2 -translate-y-1/2 flex opacity-0 group-hover:opacity-100 transition-opacity duration-200",
      variant === "sent"
        ? "-left-1 -translate-x-full flex-row-reverse"
        : "-right-1 translate-x-full",
      className,
    )}
    {...props}
  >
    {children}
  </div>
));
ChatBubbleActionWrapper.displayName = "ChatBubbleActionWrapper";

export {
  ChatBubble,
  ChatBubbleAvatar,
  ChatBubbleMessage,
  ChatBubbleTimestamp,
  chatBubbleVariant,
  chatBubbleMessageVariants,
  ChatBubbleAction,
  ChatBubbleActionWrapper,
};
