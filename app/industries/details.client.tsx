"use client";

import { CheckCircle } from "lucide-react";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import GlassCard from "@/components/ui/GlassCard";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { industries } from "@/data/industries";

export default function IndustryDetail({ id }: { id: string }) {
  const industry = industries.find((i) => i.id === id);
  if (!industry) return null;

  return (
    <div className="pt-28 pb-20">
      <Container>
        <Badge variant="purple" className="mb-4">{industry.name}</Badge>
        <SectionHeading title={`حلول ${industry.name}`} subtitle={industry.description} align="right" />
        <div className="max-w-3xl">
          <GlassCard>
            <p className="text-white/50 leading-relaxed mb-6">{industry.description}</p>
            <a href="/demo"><Button>احجز Demo مجاني</Button></a>
          </GlassCard>
        </div>
      </Container>
    </div>
  );
}
