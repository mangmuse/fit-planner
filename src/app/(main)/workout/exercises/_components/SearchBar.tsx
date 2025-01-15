import Image from "next/image";
import searchLens from "public/search_lens.svg";

type SearchBarProps = {
  onChange: (keyword: string) => void;
  keyword: string;
};

const SearchBar = ({ onChange, keyword }: SearchBarProps) => {
  return (
    <div className="relative w-full h-[37px] text-text-black">
      <input
        className="w-full h-full pl-10 pr-2 rounded-lg outline-none"
        type="text"
        value={keyword}
        onChange={(e) => onChange(e.target.value)}
      />
      <Image
        className="absolute left-2 top-1/2 transform -translate-y-1/2"
        src={searchLens}
        alt="검색"
      />
    </div>
  );
};

export default SearchBar;
