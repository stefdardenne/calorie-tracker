import { useEffect, useMemo, useRef, useState } from "react";

import type { CompositionRoot } from "../../application/composition";
import { DomainError } from "../../domain/errors";
import type { FoodItem } from "../../domain/models";
import { calculateCaloriesFromMacros } from "../../domain/rules/nutrition/nutrition";

interface FoodsPageProps {
  composition: CompositionRoot;
}

type FoodsSortKey =
  | "name"
  | "baseQuantity"
  | "unit"
  | "carbohydrates"
  | "proteins"
  | "fats"
  | "totalCalories";

type SortDirection = "asc" | "desc";

export function FoodsPage({ composition }: FoodsPageProps) {
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [editingFoodId, setEditingFoodId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState({
    name: "",
    unit: "g" as FoodItem["unit"],
    baseQuantity: 100,
    carbohydrates: 0,
    proteins: 0,
    fats: 0,
  });
  const [status, setStatus] = useState<string>("");
  const [isError, setIsError] = useState(false);
  const [sortKey, setSortKey] = useState<FoodsSortKey>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const foodDialogRef = useRef<HTMLDialogElement | null>(null);

  function getFoodCalories(food: FoodItem): number {
    return calculateCaloriesFromMacros({
      carbohydrates: food.carbohydrates,
      proteins: food.proteins,
      fats: food.fats,
    });
  }

  const sortedFoods = useMemo(() => {
    const nextFoods = [...foods];
    nextFoods.sort((left, right) => {
      const directionMultiplier = sortDirection === "asc" ? 1 : -1;

      if (sortKey === "name" || sortKey === "unit") {
        return (
          left[sortKey].localeCompare(right[sortKey]) * directionMultiplier
        );
      }

      if (sortKey === "totalCalories") {
        return (
          (getFoodCalories(left) - getFoodCalories(right)) * directionMultiplier
        );
      }

      return (left[sortKey] - right[sortKey]) * directionMultiplier;
    });

    return nextFoods;
  }, [foods, sortDirection, sortKey]);

  async function refreshFoods() {
    const nextFoods = await composition.listFoodItems();
    setFoods(nextFoods);
  }

  useEffect(() => {
    void refreshFoods();
  }, []);

  function openCreateFoodModal(): void {
    setEditingFoodId(null);
    setFormValues({
      name: "",
      unit: "g",
      baseQuantity: 100,
      carbohydrates: 0,
      proteins: 0,
      fats: 0,
    });
    foodDialogRef.current?.showModal();
  }

  function openEditFoodModal(food: FoodItem): void {
    setEditingFoodId(food.id);
    setFormValues({
      name: food.name,
      unit: food.unit,
      baseQuantity: food.baseQuantity,
      carbohydrates: food.carbohydrates,
      proteins: food.proteins,
      fats: food.fats,
    });
    foodDialogRef.current?.showModal();
  }

  function closeFoodModal(): void {
    foodDialogRef.current?.close();
  }

  async function handlePersistFood(): Promise<void> {
    try {
      const food: FoodItem = {
        id: editingFoodId ?? `food-${Date.now()}`,
        ...formValues,
      };

      await composition.createFoodItem(food);
      setStatus(editingFoodId ? "Food updated" : "Food added");
      setIsError(false);
      await refreshFoods();
      closeFoodModal();
    } catch (error) {
      const message =
        error instanceof DomainError
          ? `${error.code}: ${error.message}`
          : String(error);
      setStatus(message);
      setIsError(true);
    }
  }

  async function handleDeleteFood(id: string): Promise<void> {
    await composition.deleteFoodItem(id);
    await refreshFoods();
  }

  function toggleSort(column: FoodsSortKey): void {
    if (sortKey === column) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(column);
    setSortDirection("asc");
  }

  function getSortIndicator(column: FoodsSortKey): string {
    if (sortKey !== column) {
      return "";
    }
    return sortDirection === "asc" ? " \u2191" : " \u2193";
  }

  return (
    <div className="foods-page">
      <section className="panel">
        <div className="meals-toolbar">
          <h2>Foods</h2>
          <button onClick={openCreateFoodModal} type="button">
            Add food
          </button>
        </div>
      </section>

      <p className={isError ? "status status--error" : "status"}>{status}</p>

      <section className="panel">
        <h2>Saved Foods</h2>
        {foods.length === 0 ? (
          <p>No foods yet</p>
        ) : (
          <table className="foods-table">
            <thead>
              <tr>
                <th>
                  <button
                    className="table-sort"
                    onClick={() => toggleSort("name")}
                    type="button"
                  >
                    Name{getSortIndicator("name")}
                  </button>
                </th>
                <th>
                  <button
                    className="table-sort"
                    onClick={() => toggleSort("baseQuantity")}
                    type="button"
                  >
                    Base Quantity{getSortIndicator("baseQuantity")}
                  </button>
                </th>
                <th>
                  <button
                    className="table-sort"
                    onClick={() => toggleSort("unit")}
                    type="button"
                  >
                    Unit{getSortIndicator("unit")}
                  </button>
                </th>
                <th>
                  <button
                    className="table-sort"
                    onClick={() => toggleSort("carbohydrates")}
                    type="button"
                  >
                    Carbs{getSortIndicator("carbohydrates")}
                  </button>
                </th>
                <th>
                  <button
                    className="table-sort"
                    onClick={() => toggleSort("proteins")}
                    type="button"
                  >
                    Protein{getSortIndicator("proteins")}
                  </button>
                </th>
                <th>
                  <button
                    className="table-sort"
                    onClick={() => toggleSort("fats")}
                    type="button"
                  >
                    Fat{getSortIndicator("fats")}
                  </button>
                </th>
                <th>
                  <button
                    className="table-sort"
                    onClick={() => toggleSort("totalCalories")}
                    type="button"
                  >
                    Total kcal{getSortIndicator("totalCalories")}
                  </button>
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedFoods.map((food) => (
                <tr key={food.id}>
                  <td>{food.name}</td>
                  <td>{food.baseQuantity}</td>
                  <td>{food.unit}</td>
                  <td>{food.carbohydrates}g</td>
                  <td>{food.proteins}g</td>
                  <td>{food.fats}g</td>
                  <td>{getFoodCalories(food).toFixed(1)}</td>
                  <td className="inline-actions">
                    <button
                      onClick={() => openEditFoodModal(food)}
                      type="button"
                    >
                      Edit
                    </button>
                    <button
                      className="button-danger"
                      onClick={() => handleDeleteFood(food.id)}
                      type="button"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <dialog className="crud-modal" ref={foodDialogRef}>
        <h3>{editingFoodId ? "Edit Food" : "Add Food"}</h3>
        <label className="modal-field">
          Name
          <input
            required
            type="text"
            value={formValues.name}
            onChange={(event) =>
              setFormValues((current) => ({
                ...current,
                name: event.target.value,
              }))
            }
          />
        </label>
        <label className="modal-field">
          Unit
          <select
            value={formValues.unit}
            onChange={(event) =>
              setFormValues((current) => ({
                ...current,
                unit: event.target.value as FoodItem["unit"],
              }))
            }
          >
            <option value="g">grams</option>
            <option value="ml">ml</option>
            <option value="piece">piece</option>
          </select>
        </label>
        <label className="modal-field">
          Base quantity
          <input
            min="0.1"
            step="0.1"
            type="number"
            value={formValues.baseQuantity}
            onChange={(event) =>
              setFormValues((current) => ({
                ...current,
                baseQuantity: Number(event.target.value),
              }))
            }
          />
        </label>
        <label className="modal-field">
          Carbs
          <input
            min="0"
            step="0.1"
            type="number"
            value={formValues.carbohydrates}
            onChange={(event) =>
              setFormValues((current) => ({
                ...current,
                carbohydrates: Number(event.target.value),
              }))
            }
          />
        </label>
        <label className="modal-field">
          Protein
          <input
            min="0"
            step="0.1"
            type="number"
            value={formValues.proteins}
            onChange={(event) =>
              setFormValues((current) => ({
                ...current,
                proteins: Number(event.target.value),
              }))
            }
          />
        </label>
        <label className="modal-field">
          Fat
          <input
            min="0"
            step="0.1"
            type="number"
            value={formValues.fats}
            onChange={(event) =>
              setFormValues((current) => ({
                ...current,
                fats: Number(event.target.value),
              }))
            }
          />
        </label>
        <div className="modal-actions">
          <button className="modal-cancel" onClick={closeFoodModal}>
            Cancel
          </button>
          <button
            className="modal-confirm"
            onClick={() => {
              void handlePersistFood();
            }}
          >
            {editingFoodId ? "Update food" : "Create food"}
          </button>
        </div>
      </dialog>
    </div>
  );
}
