import { CATEGORYLIST } from "@/constants/filters";
import FilterButton from "./FilterButton";
import { Category } from "@/types/filters";
// TODO: TypeFilter 와의 통합 필요성

type CategoryFilterProps = {
  selectedCategory: Category;
  onClick: (category: Category) => void;
};

const CategoryFilter = ({ selectedCategory, onClick }: CategoryFilterProps) => {
  return (
    <nav className="flex gap-1">
      {CATEGORYLIST.map((category, idx) => (
        <FilterButton<Category>
          key={idx}
          onClick={onClick}
          isSelected={selectedCategory === category}
          label={category}
        />
      ))}
    </nav>
  );
};

export default CategoryFilter;
