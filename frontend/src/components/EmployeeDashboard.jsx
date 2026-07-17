import { ClockIcon, Download, FileIcon, Package } from "lucide-react";

const EmployeeDashboard = ({ data, user }) => {
  const cards = [
    {
      icon: Package,
      value: data.productsAvailaible,
      title: "Products Available",
    },
    {
      icon: FileIcon,
      value: data.documentsAvailaible,
      title: "Documents Avialaible",
    },
    {
      icon: ClockIcon,
      value: data.recentlyAddedDocs,
      title: "Recently Added Documents",
    },
    {
      icon: Download,
      value: data.myDownloads,
      title: "My Downloads",
    },
  ];
  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <p className="page-title">Welcome {user?.name}</p>
        <p className="page-subtitle">Employee Dashboard</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 sm:gap-5 mb-8">
        {cards.map((card, index) => (
          <div
            key={index}
            className="card card-hover p-5 sm:p-6 relative overflow-hidden group flex items-center justify-between"
          >
            <div className="absolute left-0 top-0 bottom-0 w-1 rounded-r-full bg-slate-500/70 group-hover:bg-indigo-500/70" />
            <div className="space-y-2">
              <p className="text-slate-500 font-medium">{card.title}</p>
              <p className="text-slate-900 text-lg font-semibold">
                {card.value}
              </p>
            </div>
            <div className="size-10 p-2.5 rounded-lg bg-slate-100 text-slate-600 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
              <card.icon className="h-5 w-5 text-slate-700" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmployeeDashboard;
