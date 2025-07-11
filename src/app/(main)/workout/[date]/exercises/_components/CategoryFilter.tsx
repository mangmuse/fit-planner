import { CATEGORY_LIST } from "@/constants/filters";
import FilterButton from "./FilterButton";
import { Category } from "@/types/filters";

export type CategoryFilterProps = {
  selectedCategory: Category;
  onClick: (category: Category) => void;
};

const CategoryFilter = ({ selectedCategory, onClick }: CategoryFilterProps) => {
  return (
    <nav data-testid="category-filter" role="tablist">
      <div className="flex gap-1.5 mb-1.5">
        {CATEGORY_LIST.slice(0, 4).map((category, idx) => (
          <FilterButton<Category>
            key={`category-${idx}`}
            onClick={onClick}
            isSelected={selectedCategory === category}
            label={category}
          />
        ))}
      </div>
      <div className="flex gap-1.5">
        {CATEGORY_LIST.slice(4).map((category, idx) => (
          <FilterButton<Category>
            key={`category-${idx + 4}`}
            onClick={onClick}
            isSelected={selectedCategory === category}
            label={category}
          />
        ))}
      </div>
    </nav>
  );
};

export default CategoryFilter;
