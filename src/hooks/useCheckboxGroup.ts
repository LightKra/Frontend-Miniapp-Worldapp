import { useState, ChangeEvent } from "react";

export const useCheckboxGroup = <T extends Record<string, boolean>>(
  initialState: T
) => {
  const [checkboxes, setCheckboxes] = useState<T>(initialState);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setCheckboxes((prev) => ({ ...prev, [name]: checked }));
  };

  const areAllChecked = Object.values(checkboxes).every((value) => value);

  return { checkboxes, handleChange, areAllChecked };
};
