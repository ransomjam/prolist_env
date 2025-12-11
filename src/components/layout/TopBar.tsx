import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo.png";

interface TopBarProps {
  title: string;
  showBack?: boolean;
  rightElement?: React.ReactNode;
  showLogo?: boolean;
}

export function TopBar({ title, showBack = false, rightElement, showLogo = false }: TopBarProps) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border safe-top">
      <div className="flex items-center justify-between h-14 px-4">
        <div className="flex items-center gap-3">
          {showBack && (
            <button
              onClick={() => navigate(-1)}
              className="p-2 -ml-2 rounded-lg hover:bg-muted transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" strokeWidth={1.5} />
            </button>
          )}
          {showLogo && (
            <img src={logo} alt="ProList" className="w-8 h-8 rounded-lg" />
          )}
          <h1 className="text-lg font-semibold text-foreground tracking-tight">{title}</h1>
        </div>
        {rightElement && <div>{rightElement}</div>}
      </div>
    </header>
  );
}
