import { TransactionFormData } from "../types/transaction";

export const validateInitialForm = (data: TransactionFormData) => {
  const errors: { [key: string]: string } = {};

  if (!data.country) {
    errors.country = "Debes seleccionar un país";
  }

  const rawAmount = (data.amount || "").replace(",", ".").trim();
  const parsedAmount = parseFloat(rawAmount);
  if (!rawAmount || isNaN(parsedAmount) || parsedAmount <= 0) {
    errors.amount = "El monto debe ser un número mayor a 0";
  }

  if (!data.paymentMethod) {
    errors.paymentMethod = "Debes seleccionar un método de pago";
  }

  return errors;
};

export const hasErrors = (errors: { [key: string]: string }) =>
  Object.keys(errors).length > 0;

export const validatePersonalInfo = (formData: TransactionFormData) => {
  const errors: { [key: string]: string } = {};

  if (!formData.fullName?.trim()) {
    errors.fullName = "El nombre completo es requerido";
  }

  if (!formData.email?.trim()) {
    errors.email = "El correo electrónico es requerido";
  }

  if (!formData.phone?.trim()) {
    errors.phone = "El teléfono es requerido";
  }

  if (!formData.documentType?.trim()) {
    errors.documentType = "El tipo de documento es requerido";
  }

  if (!formData.documentNumber?.trim()) {
    errors.documentNumber = "El número de documento es requerido";
  }

  if (!formData.accountType?.trim()) {
    errors.accountType = "El tipo de cuenta es requerido";
  }

  if (!formData.accountNumber?.trim()) {
    errors.accountNumber = "El número de cuenta es requerido";
  }

  return errors;
};
