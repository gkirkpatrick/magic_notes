interface SearchBarProps {
  searchText: string;
  includeTitle: boolean;
  onChange: (searchText: string, includeTitle: boolean) => void;
}

export function SearchBar({ searchText, includeTitle, onChange }: SearchBarProps) {
  return (
    <div className="flex flex-col gap-2">
      <input
        type="text"
        value={searchText}
        onChange={(e) => onChange(e.target.value, includeTitle)}
        placeholder="Search notes..."
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
      />
      <label className="flex items-center gap-2 cursor-pointer select-none justify-end sm:justify-start">
        <input
          type="checkbox"
          checked={includeTitle}
          onChange={(e) => onChange(searchText, e.target.checked)}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
        />
        <span className="text-sm text-gray-700">Include title</span>
      </label>
    </div>
  );
}
