interface CountryData {
  id: string;
  name: string;
}

interface BankData {
  id: string;
  name: string;
  country_id: string;
}

interface DocumentType {
  id: string;
  type: string;
  country_id: string;
}

export const filterBanksByCountry = (banks: BankData[], countryId: string) => {
  return banks.filter((bank) => bank.country_id === countryId);
};

export const filterDocumentTypesByCountry = (
  documentTypes: DocumentType[],
  countryId: string
) => {
  return documentTypes.filter((doc) => doc.country_id === countryId);
};

export const getCountryById = (countries: CountryData[], countryId: string) => {
  return countries.find((country) => country.id === countryId);
};
