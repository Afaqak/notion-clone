import { useEffect } from 'react';

type Handler = (event: MouseEvent | TouchEvent) => void;

const useOnClickOutside = (ref: React.RefObject<HTMLElement>, handler: Handler | any) => {
  useEffect(
    () => {
      const listener = (event: MouseEvent | TouchEvent) => {
        // Do nothing if clicking ref's element or descendent elements
        if (!ref.current || ref?.current.contains(event.target as Node)) {
          return;
        }

        handler(event);
      };

      const escListener=(event:KeyboardEvent)=>{
       
      }

      document.addEventListener('keydown',escListener)
      document.addEventListener('mousedown', listener);
      document.addEventListener('touchstart', listener);

      return () => {
        document.removeEventListener('keydown',escListener)
        document.removeEventListener('mousedown', listener);
        document.removeEventListener('touchstart', listener);
      };
    },
    [ref, handler],
  );
};

export default useOnClickOutside;
