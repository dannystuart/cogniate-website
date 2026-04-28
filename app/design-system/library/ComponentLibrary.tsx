import EyebrowBadge from "../../components/EyebrowBadge";
import ButtonPrimary from "../../components/ButtonPrimary";
import ButtonSecondary from "../../components/ButtonSecondary";
import LibraryCard from "./LibraryCard";
import VariantTile from "./VariantTile";

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
    </div>
  );
}
