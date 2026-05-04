import type { FormConfig, FormId } from "./types";

export const FORMS: Record<FormId, FormConfig> = {
  community: {
    portalId: "244026025",
    formId: "a8691448-a661-454e-a586-b474f385d0e6",
    region: "na2",
    heading: "Join us.",
    sub: "Be part of the conversation.",
    body: "Get early access, shape the roadmap, and learn alongside the people building Cogniate.",
    success: {
      heading: "You're in.",
      sub: "We'll be in touch shortly.",
      body: "Thanks for joining the Cogniate community. Watch your inbox for early-access details.",
    },
  },
  "book-a-demo": {
    portalId: "244026025",
    formId: "686a9dfe-0d99-4ff4-b46f-647adb4f503a",
    region: "na2",
    heading: "Let's talk.",
    sub: "See Cogniate in action.",
    body: "Tell us a little about your team and we'll set up a tailored walkthrough.",
    success: {
      heading: "Thanks.",
      sub: "We'll reach out to schedule.",
      body: "A member of our team will be in touch shortly to find a time that works for you.",
    },
  },
};

export const FORM_IDS = Object.keys(FORMS) as FormId[];

export function isFormId(value: string): value is FormId {
  return (FORM_IDS as string[]).includes(value);
}
