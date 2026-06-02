import React, { useState } from "react";
import { ChevronRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SharedNav from "@/components/SharedNav";
import { TUTORIALS } from "@/components/tutorial/tutorialData";
import TutorialSection from "@/components/tutorial/TutorialSection";

export default function Tutorial() {
  const [selectedTutorial, setSelectedTutorial] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTutorials = TUTORIALS.filter(
    (t) =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.sections.some((s) => s.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const selected = selectedTutorial ? TUTORIALS.find((t) => t.id === selectedTutorial) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <SharedNav mode="user" />

      <div className="max-w-6xl mx-auto px-4 py-12">
        {!selectedTutorial ? (
          <>
            <div className="mb-12">
              <h1 className="text-4xl font-bold text-slate-900 mb-3">Platform Tutorials</h1>
              <p className="text-lg text-slate-600">Learn how to get the most out of our platform</p>
            </div>

            <div className="mb-8">
              <Input
                type="search"
                placeholder="Search tutorials..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-md"
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredTutorials.map((tutorial) => {
                const Icon = tutorial.icon;
                return (
                  <Card
                    key={tutorial.id}
                    className="hover:shadow-lg transition-all cursor-pointer group"
                    onClick={() => setSelectedTutorial(tutorial.id)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <Icon className="w-8 h-8 text-primary" />
                        <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
                      </div>
                      <CardTitle className="mt-3">{tutorial.title}</CardTitle>
                      <CardDescription>{tutorial.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-slate-600">
                        {tutorial.sections.length} step-by-step topics
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {filteredTutorials.length === 0 && (
              <div className="text-center py-12">
                <p className="text-slate-600">No tutorials found. Try a different search.</p>
              </div>
            )}
          </>
        ) : (
          <div>
            <Button variant="outline" onClick={() => setSelectedTutorial(null)} className="mb-6">
              ← Back to Tutorials
            </Button>

            {selected && (
              <>
                <div className="mb-8">
                  <div className="flex items-start gap-4">
                    {React.createElement(selected.icon, { className: "w-12 h-12 text-primary flex-shrink-0" })}
                    <div>
                      <h1 className="text-3xl font-bold text-slate-900">{selected.title}</h1>
                      <p className="text-slate-600 mt-2">{selected.description}</p>
                    </div>
                  </div>
                </div>

                {selected.video && (
                  <div className="mb-8 aspect-video w-full overflow-hidden rounded-xl border border-slate-200 shadow-sm bg-black">
                    <iframe
                      className="w-full h-full"
                      src={selected.video}
                      title={`${selected.title} video walkthrough`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                )}

                <h2 className="text-lg font-semibold text-slate-900 mb-4">Step-by-step guide</h2>
                <div className="space-y-4">
                  {selected.sections.map((section, idx) => (
                    <TutorialSection key={idx} index={idx} section={section} />
                  ))}
                </div>

                <div className="mt-12 p-6 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-900">
                    💡 <strong>Need more help?</strong> Ask our AI assistant any questions about these topics,
                    and it will guide you through the right tutorial section.
                  </p>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}