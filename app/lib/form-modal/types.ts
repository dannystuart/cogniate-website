export type FormId = "community" | "book-a-demo";

export interface FormConfig {
  portalId: string;
  formId: string;
  region: string;
  heading: string;
  sub: string;
  body: string;
  success: {
    heading: string;
    sub: string;
    body: string;
  };
}
