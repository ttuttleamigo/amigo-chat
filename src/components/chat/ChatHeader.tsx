import Image from "next/image";
import { HelpCircle, X } from "lucide-react"; // Removed MessageSquareText, Added X icon
import { ModeToggle } from "@/components/mode-toggle";

interface ChatHeaderProps {
  onFaqClick?: () => void;
  onCloseClick?: () => void; // For closing the widget
  showCloseButton?: boolean; // Control close button visibility
  // onFeedbackClick?: () => void; // Feedback deferred
}

export default function ChatHeader({ 
  onFaqClick, 
  onCloseClick, 
  showCloseButton 
}: ChatHeaderProps) {
  // Assuming header padding (p-3) makes usable height around 44px (e.g. 68px total - 2*12px padding)
  // 3/4 of ~44px is ~33px. Let's target logo height of 32px or 36px.
  // The actual asset "amigo-virtual-assistant.png" is wide.
  // We need its actual dimensions or use layout="fill" with a sized parent.
  // For now, let's use explicit dimensions assuming a common banner aspect ratio.
  // A typical banner might be 250x50. If we want height ~36px, width would be ~180px.
  // This might be too wide. Let's try a smaller width and let height adjust.
  // Or, set height and use object-contain.
  return (
    <div className="flex items-center justify-between w-full p-3 bg-card dark:bg-[#0070A8] text-card-foreground dark:text-white rounded-t-lg"> {/* Theme-aware header style */}
      <div className="flex items-center">
        {/* Using a container to control the image size and allow object-contain */}
        <div className="h-[40px] w-[200px] relative"> {/* Increased height, adjusted width for typical banner aspect ratio */}
          <Image 
            src="/amigo-virtual-assistant.png" 
            alt="Amigo Virtual Assistant Logo" 
            layout="fill"
            objectFit="contain" // Ensures aspect ratio is maintained within container
            className="rounded-md" 
            onError={(e) => {
              // Fallback if image fails to load
              const target = e.target as HTMLImageElement;
              target.onerror = null; 
              // Consider a simpler text fallback or a generic icon if outlined logo is also problematic
              target.alt = "Amigo Logo (Error)"; 
            }}
          />
        </div>
      </div>
      <div className="flex items-center gap-2"> {/* Using gap-2 for more uniform spacing between icons */}
        {onFaqClick && ( // Conditionally render FAQ button
          <button 
            onClick={onFaqClick}
            className="flex items-center space-x-1 text-sm hover:opacity-80 font-montserrat p-1" // Added font and padding
            aria-label="Frequently Asked Questions"
          >
            <HelpCircle size={18} />
            {/* <span>Faq</span> // Text removed to match Figma more closely if space is tight */}
          </button>
        )}
        {/* Feedback button can be added here if needed, styled similarly */}
        {/* <button className="flex items-center space-x-1 text-sm hover:opacity-80 p-1">
          <MessageSquareText size={18} />
        </button> */}
        <ModeToggle />
        {showCloseButton && onCloseClick && ( // Conditionally render Close button
          <button 
            onClick={onCloseClick}
            className="flex items-center justify-center w-7 h-7 hover:bg-white/20 rounded-full p-1" // Added padding
            aria-label="Close chat"
          >
            <X size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
