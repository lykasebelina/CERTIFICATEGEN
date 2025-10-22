import { useState } from "react";
import {
  Award,
  Search,
  Filter,
  Trophy,
  Medal,
  Star,
  Heart,
  Briefcase,
  GraduationCap,
  Dumbbell,
  BookOpen,
  Building,
  Users,
  Lightbulb,
  HandHeart,
} from "lucide-react";

function TemplateLibrary() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // 🧩 Mock template data (with icons and color backgrounds)
  const templates = [
    { id: 1, name: "Certificate of Achievement", category: "Achievement", icon: Trophy, color: "bg-blue-600" },
    { id: 2, name: "Certificate of Completion", category: "Completion", icon: Medal, color: "bg-green-600" },
    { id: 3, name: "Certificate of Excellence", category: "Excellence", icon: Star, color: "bg-yellow-500" },
    { id: 4, name: "Certificate of Appreciation", category: "Appreciation", icon: Heart, color: "bg-pink-500" },
    { id: 5, name: "Employee of the Month", category: "Workplace", icon: Briefcase, color: "bg-purple-600" },
    { id: 6, name: "Outstanding Performance", category: "Workplace", icon: Award, color: "bg-indigo-600" },
    { id: 7, name: "Best Student Award", category: "Academic", icon: GraduationCap, color: "bg-red-600" },
    { id: 8, name: "Sportsmanship Award", category: "Sports", icon: Dumbbell, color: "bg-orange-500" },
    { id: 9, name: "Training Completion", category: "Training", icon: BookOpen, color: "bg-teal-600" },
    { id: 10, name: "Corporate Recognition", category: "Corporate", icon: Building, color: "bg-slate-600" },
    { id: 11, name: "Leadership Award", category: "Leadership", icon: Users, color: "bg-cyan-600" },
    { id: 12, name: "Top Performer", category: "Workplace", icon: Medal, color: "bg-emerald-600" },
    { id: 13, name: "Excellence in Innovation", category: "Innovation", icon: Lightbulb, color: "bg-amber-500" },
    { id: 14, name: "Community Service", category: "Volunteer", icon: HandHeart, color: "bg-rose-600" },
  ];

  // 🧠 Filter logic
  const filteredTemplates = templates.filter(
    (template) =>
      (selectedCategory === "All" || template.category === selectedCategory) &&
      template.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full bg-slate-900 text-white p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold mb-1">Template Library</h2>
          <p className="text-slate-400 text-sm">
            Browse and use pre-made certificate templates crafted for every occasion
          </p>
        </div>
        <Award className="w-10 h-10 text-blue-400" />
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
        <div className="relative w-full md:w-1/2">
          <Search className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800 text-slate-200 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="relative">
          <Filter className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="appearance-none bg-slate-800 text-slate-200 rounded-lg pl-10 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option>All</option>
            <option>Achievement</option>
            <option>Completion</option>
            <option>Excellence</option>
            <option>Appreciation</option>
            <option>Workplace</option>
            <option>Academic</option>
            <option>Sports</option>
            <option>Training</option>
            <option>Corporate</option>
            <option>Leadership</option>
            <option>Innovation</option>
            <option>Volunteer</option>
          </select>
        </div>
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredTemplates.length > 0 ? (
          filteredTemplates.map((template) => {
            const Icon = template.icon;
            return (
              <div
                key={template.id}
                className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700 hover:border-blue-500 transition-all group cursor-pointer hover:shadow-lg hover:scale-[1.02]"
              >
                {/* Icon Thumbnail */}
                <div className={`w-full h-40 flex items-center justify-center ${template.color}`}>
                  <Icon className="w-16 h-16 text-white opacity-90 group-hover:scale-110 transition-transform duration-200" />
                </div>

                {/* Details */}
                <div className="p-4">
                  <h3 className="font-semibold text-slate-100">{template.name}</h3>
                  <p className="text-slate-400 text-xs mt-1">{template.category}</p>
                  <button className="mt-3 w-full py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-md text-xs font-medium transition">
                    Use Template
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full text-center text-slate-500 mt-20">
            No templates found for your search.
          </div>
        )}
      </div>
    </div>
  );
}

export default TemplateLibrary;
