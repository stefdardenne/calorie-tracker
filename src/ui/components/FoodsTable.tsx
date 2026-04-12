import type { FoodItem } from "../../domain/models";
import { calculateCaloriesFromMacros } from "../../domain/rules/nutrition/nutrition";

interface FoodsTableProps {
  foods: FoodItem[];
  onDelete: (id: string) => Promise<void>;
}

export function FoodsTable({ foods, onDelete }: FoodsTableProps) {
  if (foods.length === 0) {
    return (
      <section className="panel">
        <h2>Saved Foods</h2>
        <p>No foods yet</p>
      </section>
    );
  }

  return (
    <section className="panel">
      <h2>Saved Foods</h2>
      <table className="foods-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Base Quantity</th>
            <th>Unit</th>
            <th>Carbs</th>
            <th>Protein</th>
            <th>Fat</th>
            <th>Total kcal</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {foods.map((food) => (
            <tr key={food.id}>
              <td>{food.name}</td>
              <td>{food.baseQuantity}</td>
              <td>{food.unit}</td>
              <td>{food.carbohydrates}g</td>
              <td>{food.proteins}g</td>
              <td>{food.fats}g</td>
              <td>
                {calculateCaloriesFromMacros({
                  carbohydrates: food.carbohydrates,
                  proteins: food.proteins,
                  fats: food.fats,
                }).toFixed(1)}
              </td>
              <td>
                <button onClick={() => onDelete(food.id)} type="button">
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
