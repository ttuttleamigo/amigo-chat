import * as React from "react";
import { cn } from "@/lib/utils";

// Removed ArrowDown, Button, useAutoScroll imports

type ChatMessageListProps = React.HTMLAttributes<HTMLDivElement>;
  // smooth prop is no longer used and interface became empty

const ChatMessageList = React.forwardRef<HTMLDivElement, ChatMessageListProps>(
  ({ className, children, ...props }, ref) => { // Changed _ref to ref to be used by parent
    // Removed useAutoScroll hook and related logic

    return (
      // The parent div in page.tsx will handle scrolling (overflow-y-auto and p-4)
      // This component now just structures the children with a gap.
      <div
        ref={ref} // Forwarding ref if needed by parent for direct manipulation (though not used by current scroll logic in page.tsx)
        className={cn("flex flex-col gap-6 w-full", className)} // Removed h-full, p-4, overflow-y-auto
        {...props}
      >
        {children}
      </div>
    );
  }
);

ChatMessageList.displayName = "ChatMessageList";

export { ChatMessageList };
