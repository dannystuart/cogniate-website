import EyebrowBadge from "../../components/EyebrowBadge";
import ButtonPrimary from "../../components/ButtonPrimary";
import ButtonSecondary from "../../components/ButtonSecondary";
import StoryIcon from "../../components/StoryIcon";
import NavMenu from "../../components/NavMenu";
import VideoCard from "../../components/VideoCard";
import ScrollIndicator from "../../components/ScrollIndicator";
import PlatformCardAccordion, { type AccordionCardData } from "../../components/PlatformCardAccordion";
import LibraryCard from "./LibraryCard";
import VariantTile from "./VariantTile";

const SAMPLE_ACCORDION_CARD: AccordionCardData = {
  id: "library-sample",
  title: "Sample accordion card",
  layout: "accordion",
  glowColor: "rgba(252, 232, 158, 0.12)",
  pills: [
    { label: "Pill one", description: "First pill description for the accordion showcase." },
    { label: "Pill two", description: "Second pill description for the accordion showcase." },
    { label: "Pill three", description: "Third pill description for the accordion showcase." },
    { label: "Pill four", description: "Fourth pill description for the accordion showcase." },
  ],
  visuals: [
    "/assets/platform-card-gradient.png",
    "/assets/platform-card-gradient.png",
    "/assets/platform-card-gradient.png",
    "/assets/platform-card-gradient.png",
  ],
  coverImage: "/assets/platform-card-gradient.png",
};

export default function ComponentLibrary() {
  return (
    <div className="flex flex-col gap-6">
      <LibraryCard title="EyebrowBadge" importPath="app/components/EyebrowBadge.tsx">
        <VariantTile label="Default" fullWidth>
          <EyebrowBadge>Sample</EyebrowBadge>
        </VariantTile>
      </LibraryCard>

      <LibraryCard title="ButtonPrimary" importPath="app/components/ButtonPrimary.tsx">
        <VariantTile label="variant=white, size=default">
          <ButtonPrimary variant="white" size="default">Click me</ButtonPrimary>
        </VariantTile>
        <VariantTile label="variant=white, size=small">
          <ButtonPrimary variant="white" size="small">Click me</ButtonPrimary>
        </VariantTile>
        <VariantTile label="variant=coral, size=default">
          <ButtonPrimary variant="coral" size="default">Click me</ButtonPrimary>
        </VariantTile>
        <VariantTile label="variant=coral, size=small">
          <ButtonPrimary variant="coral" size="small">Click me</ButtonPrimary>
        </VariantTile>
      </LibraryCard>

      <LibraryCard title="ButtonSecondary" importPath="app/components/ButtonSecondary.tsx">
        <VariantTile label="Default" fullWidth>
          <ButtonSecondary>Click me</ButtonSecondary>
        </VariantTile>
      </LibraryCard>

      <LibraryCard title="StoryIcon" importPath="app/components/StoryIcon.tsx">
        <VariantTile label="Warning icon" fullWidth>
          <div className="flex items-center justify-center gap-8">
            <StoryIcon
              src="/assets/story-warning-icon.svg"
              alt="Warning"
              size={147}
              glowColor="rgba(250, 103, 124, 0.5)"
            />
            <StoryIcon
              src="/assets/story-flag-icon.svg"
              alt="Flag"
              size={120}
              glowColor="rgba(172, 124, 241, 0.5)"
            />
            <StoryIcon
              src="/assets/story-lightbulb-icon.svg"
              alt="Lightbulb"
              size={120}
              glowColor="rgba(104, 233, 162, 0.5)"
            />
          </div>
        </VariantTile>
      </LibraryCard>

      <LibraryCard title="NavMenu" importPath="app/components/NavMenu.tsx">
        <VariantTile label="Default" fullWidth>
          <div className="relative h-[80px] w-full overflow-hidden">
            <NavMenu />
          </div>
        </VariantTile>
      </LibraryCard>

      <LibraryCard title="VideoCard" importPath="app/components/VideoCard.tsx">
        <VariantTile label="Default (lg+ only)" fullWidth>
          <div className="relative h-[230px] w-full">
            <VideoCard />
          </div>
        </VariantTile>
      </LibraryCard>

      <LibraryCard title="ScrollIndicator" importPath="app/components/ScrollIndicator.tsx">
        <VariantTile label="Default" fullWidth>
          <div className="relative h-[230px] w-full overflow-hidden">
            <ScrollIndicator />
          </div>
        </VariantTile>
      </LibraryCard>

      <LibraryCard title="PlatformCardAccordion" importPath="app/components/PlatformCardAccordion.tsx">
        <VariantTile label="Default" fullWidth>
          <div className="w-full min-h-[480px]">
            <PlatformCardAccordion card={SAMPLE_ACCORDION_CARD} />
          </div>
        </VariantTile>
      </LibraryCard>
    </div>
  );
}
