import { MessageCircle } from "lucide-react";

export const WhatsappIcon = () => {
  return (
    <div
      className="fixed bottom-4 right-4 bg-green-500 p-3 rounded-full shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
      onClick={() => window.open("https://wa.me/573146167304", "_blank")}
    >
      <MessageCircle className="w-6 h-6" />
    </div>
  );
};
