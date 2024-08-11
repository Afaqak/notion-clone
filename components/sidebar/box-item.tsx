
import React from "react";

const BoxItem = ({ icon, text }: { icon: any; text: String }) => {
  return (
    <div className="flex cursor-pointer hover:bg-stone-200 rounded-md p-2 text-neutral-500 gap-4 items-center">
      {icon}
      {text}
    </div>
  );
};

export default BoxItem;
