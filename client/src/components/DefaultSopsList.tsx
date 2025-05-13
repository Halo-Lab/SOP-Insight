import * as React from "react";
import { sopService } from "@/lib/services/sop.service";
import type { DefaultSop } from "@/lib/services/sop.service";

interface DefaultSopsListProps {
  roleId: number;
  onSelectSop: (content: string) => void;
}

export const DefaultSopsList: React.FC<DefaultSopsListProps> = ({
  roleId,
  onSelectSop,
}) => {
  const [sops, setSops] = React.useState<DefaultSop[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const loadSops = async () => {
      if (!roleId) return;
      setLoading(true);
      setError(null);
      try {
        const data = await sopService.getDefaultSopsByRole(roleId);
        setSops(data);
      } catch (err) {
        setError("Failed to load SOPs: " + err);
      } finally {
        setLoading(false);
      }
    };
    loadSops();
  }, [roleId]);

  if (!roleId) return null;
  if (loading) return <div className="text-center py-4">Loading SOPs...</div>;
  if (error)
    return <div className="text-red-500 text-center py-4">{error}</div>;
  if (!sops.length)
    return (
      <div className="text-center py-4">No SOPs available for this role.</div>
    );

  return (
    <div>
      <div className="font-semibold text-md mb-2 text-center">
        Platform Suggested SOPs
      </div>
      <div className="space-y-4 max-h-[30vh] overflow-y-auto pr-2">
        {sops.map((sop) => (
          <div
            key={sop.id}
            className="rounded border p-3 bg-white hover:bg-gray-50 flex items-center justify-between gap-2 max-w-xl mx-auto shadow-sm transition-all hover:shadow-md cursor-pointer"
            onClick={() => onSelectSop(sop.goal)}
          >
            <div className="flex-1 min-w-0 group">
              <div className="font-medium text-md group-hover:text-blue-600">
                {sop.name}
              </div>
              <div className="text-xs text-gray-700 mb-1">{sop.goal}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
