import * as React from "react"
import { Eye, EyeOff } from "lucide-react"
import { cn } from "@/lib/utils"

export interface PasswordInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  iconLeft?: React.ReactNode;
}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, iconLeft, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false)

    return (
      <div className="relative group">
        {iconLeft && (
          <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none z-10">
            {iconLeft}
          </div>
        )}
        <input
          type={showPassword ? "text" : "password"}
          className={cn(
            "w-full pr-12 py-3 sm:py-4 text-sm sm:text-base text-white placeholder-gray-600 bg-[#181919b3] border-2 border-[#2d2d2d] rounded-xl sm:rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-900/50 focus:border-red-800 focus:bg-black/50 transition-all duration-200 hover:border-gray-700",
            iconLeft ? "pl-10 sm:pl-12" : "pl-3 sm:pl-4",
            className
          )}
          ref={ref}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center text-gray-500 hover:text-gray-300 transition-colors z-10"
          tabIndex={-1}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" />
          ) : (
            <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
          )}
        </button>
      </div>
    )
  }
)
PasswordInput.displayName = "PasswordInput"

export { PasswordInput }
