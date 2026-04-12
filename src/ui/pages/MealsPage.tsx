import { useEffect, useMemo, useRef, useState } from "react";

import type { CompositionRoot } from "../../application/composition";
import { DomainError } from "../../domain/errors";
import type { FoodItem, LogEntry, Meal } from "../../domain/models";
import { calculateLoggedNutrition } from "../../domain/rules/nutrition/nutrition";

type DraftMealItem = {
  id: string;
  foodItemId: string;
  consumedQuantity: number;
};

interface MealsPageProps {
  composition: CompositionRoot;
}

type SortDirection = "asc" | "desc";
type SavedMealsSortKey = "name" | "ingredients" | "totalCalories";
type DraftItemsSortKey = "food" | "quantity";

export function MealsPage({ composition }: MealsPageProps) {
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [savedMeals, setSavedMeals] = useState<Meal[]>([]);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingMealId, setEditingMealId] = useState<string | null>(null);
  const [selectedFoodId, setSelectedFoodId] = useState<string>("");
  const [quantityInput, setQuantityInput] = useState<string>("100");
  const [mealNameInput, setMealNameInput] = useState<string>("");
  const [draftItems, setDraftItems] = useState<DraftMealItem[]>([]);
  const [status, setStatus] = useState<string>("");
  const [isError, setIsError] = useState(false);
  const [savedMealsSortKey, setSavedMealsSortKey] =
    useState<SavedMealsSortKey>("name");
  const [savedMealsSortDirection, setSavedMealsSortDirection] =
    useState<SortDirection>("asc");
  const [draftItemsSortKey, setDraftItemsSortKey] =
    useState<DraftItemsSortKey>("food");
  const [draftItemsSortDirection, setDraftItemsSortDirection] =
    useState<SortDirection>("asc");
  const mealDialogRef = useRef<HTMLDialogElement | null>(null);

  const canPersistDraft =
    mealNameInput.trim().length > 0 && draftItems.length > 0;

  useEffect(() => {
    async function loadMealsPageData() {
      const nextFoods = await composition.listFoodItems();
      setFoods(nextFoods);
      if (nextFoods.length > 0) {
        setSelectedFoodId(nextFoods[0].id);
      }

      const meals = await composition.listMeals();
      setSavedMeals(meals);
    }

    void loadMealsPageData();
  }, [composition]);

  async function refreshSavedMeals(): Promise<void> {
    const meals = await composition.listMeals();
    setSavedMeals(meals);
  }

  async function handleAddMealItem(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      const consumedQuantity = Number(quantityInput);
      if (!selectedFoodId) {
        throw new DomainError("INVALID_FOOD_ITEM_NAME", "Select a food item");
      }
      if (!Number.isFinite(consumedQuantity) || consumedQuantity <= 0) {
        throw new DomainError(
          "INVALID_CONSUMED_QUANTITY",
          "Quantity must be greater than 0",
        );
      }

      const selectedFood = foods.find((food) => food.id === selectedFoodId);
      if (!selectedFood) {
        throw new DomainError(
          "INVALID_FOOD_ITEM_NAME",
          "Selected food item no longer exists",
        );
      }

      const logEntry: LogEntry = {
        id: `meal-item-${Date.now()}`,
        foodItemId: selectedFood.id,
        consumedQuantity,
        occurredAt: new Date().toISOString(),
      };

      await composition.getLoggedNutritionForEntry(logEntry);

      const mealItem: DraftMealItem = {
        id: `${selectedFood.id}-${Date.now()}`,
        foodItemId: selectedFood.id,
        consumedQuantity,
      };

      setDraftItems((currentItems) => [...currentItems, mealItem]);
      setStatus("Meal item added");
      setIsError(false);
    } catch (error) {
      const message =
        error instanceof DomainError
          ? `${error.code}: ${error.message}`
          : String(error);
      setStatus(message);
      setIsError(true);
    }
  }

  function handleRemoveMealItem(id: string) {
    setDraftItems((currentItems) =>
      currentItems.filter((item) => item.id !== id),
    );
  }

  function resetMealDraft() {
    setDraftItems([]);
    setMealNameInput("");
    setEditingMealId(null);
  }

  async function handleDeleteSavedMeal(id: string): Promise<void> {
    await composition.deleteMeal(id);
    await refreshSavedMeals();
    if (editingMealId === id) {
      resetMealDraft();
    }
    setStatus("Saved meal deleted");
    setIsError(false);
  }

  function openCreateMealModal(): void {
    setModalMode("create");
    resetMealDraft();
    mealDialogRef.current?.showModal();
  }

  function openEditMealModal(meal: Meal): void {
    setModalMode("edit");
    setEditingMealId(meal.id);
    setMealNameInput(meal.name);
    setDraftItems(
      meal.items.map((item, index) => ({
        id: `${meal.id}-${item.foodItemId}-${index}`,
        foodItemId: item.foodItemId,
        consumedQuantity: item.consumedQuantity,
      })),
    );
    mealDialogRef.current?.showModal();
  }

  function closeMealModal(): void {
    mealDialogRef.current?.close();
  }

  async function handlePersistMealFromModal(): Promise<void> {
    try {
      const nowIso = new Date().toISOString();
      const existingMeal =
        editingMealId === null
          ? null
          : savedMeals.find((meal) => meal.id === editingMealId) || null;

      const meal: Meal = {
        id:
          modalMode === "edit" && editingMealId !== null
            ? editingMealId
            : `meal-${Date.now()}`,
        name: mealNameInput,
        createdAt: existingMeal?.createdAt || nowIso,
        items: draftItems.map((item) => ({
          foodItemId: item.foodItemId,
          consumedQuantity: item.consumedQuantity,
        })),
      };

      if (modalMode === "edit") {
        await composition.updateMeal(meal);
      } else {
        await composition.createMeal(meal);
      }

      await refreshSavedMeals();
      setStatus(modalMode === "edit" ? "Meal updated" : "Meal created");
      setIsError(false);
      closeMealModal();
      resetMealDraft();
    } catch (error) {
      const message =
        error instanceof DomainError
          ? `${error.code}: ${error.message}`
          : String(error);
      setStatus(message);
      setIsError(true);
    }
  }

  function getFoodItemName(foodItemId: string): string {
    return foods.find((food) => food.id === foodItemId)?.name || "Missing food";
  }

  function getMealTotalCalories(meal: Meal): number {
    return meal.items.reduce((total, item) => {
      const food = foods.find((foodItem) => foodItem.id === item.foodItemId);
      if (!food) {
        return total;
      }

      try {
        const nutrition = calculateLoggedNutrition(food, {
          id: `meal-calc-${meal.id}-${item.foodItemId}`,
          foodItemId: item.foodItemId,
          consumedQuantity: item.consumedQuantity,
          occurredAt: new Date().toISOString(),
        });
        return total + nutrition.calories;
      } catch {
        return total;
      }
    }, 0);
  }

  const sortedSavedMeals = useMemo(() => {
    const nextMeals = [...savedMeals];
    nextMeals.sort((left, right) => {
      const directionMultiplier = savedMealsSortDirection === "asc" ? 1 : -1;

      if (savedMealsSortKey === "name") {
        return left.name.localeCompare(right.name) * directionMultiplier;
      }

      if (savedMealsSortKey === "ingredients") {
        return (left.items.length - right.items.length) * directionMultiplier;
      }

      return (
        (getMealTotalCalories(left) - getMealTotalCalories(right)) *
        directionMultiplier
      );
    });
    return nextMeals;
  }, [savedMeals, savedMealsSortDirection, savedMealsSortKey, foods]);

  const sortedDraftItems = useMemo(() => {
    const nextItems = [...draftItems];
    nextItems.sort((left, right) => {
      const directionMultiplier = draftItemsSortDirection === "asc" ? 1 : -1;

      if (draftItemsSortKey === "food") {
        return (
          getFoodItemName(left.foodItemId).localeCompare(
            getFoodItemName(right.foodItemId),
          ) * directionMultiplier
        );
      }

      return (
        (left.consumedQuantity - right.consumedQuantity) * directionMultiplier
      );
    });
    return nextItems;
  }, [draftItems, draftItemsSortDirection, draftItemsSortKey, foods]);

  function toggleSavedMealsSort(column: SavedMealsSortKey): void {
    if (savedMealsSortKey === column) {
      setSavedMealsSortDirection((current) =>
        current === "asc" ? "desc" : "asc",
      );
      return;
    }

    setSavedMealsSortKey(column);
    setSavedMealsSortDirection("asc");
  }

  function toggleDraftItemsSort(column: DraftItemsSortKey): void {
    if (draftItemsSortKey === column) {
      setDraftItemsSortDirection((current) =>
        current === "asc" ? "desc" : "asc",
      );
      return;
    }

    setDraftItemsSortKey(column);
    setDraftItemsSortDirection("asc");
  }

  function getSavedMealsSortIndicator(column: SavedMealsSortKey): string {
    if (savedMealsSortKey !== column) {
      return "";
    }
    return savedMealsSortDirection === "asc" ? " \u2191" : " \u2193";
  }

  function getDraftItemsSortIndicator(column: DraftItemsSortKey): string {
    if (draftItemsSortKey !== column) {
      return "";
    }
    return draftItemsSortDirection === "asc" ? " \u2191" : " \u2193";
  }

  if (foods.length === 0) {
    return (
      <section className="panel">
        <h2>Compose Meal</h2>
        <p>Create at least one food item before composing meals.</p>
      </section>
    );
  }

  return (
    <div className="foods-page">
      <section className="panel">
        <div className="meals-toolbar">
          <h2>Meals</h2>
          <button onClick={openCreateMealModal} type="button">
            Add meal
          </button>
        </div>
      </section>

      <p className={isError ? "status status--error" : "status"}>{status}</p>

      <section className="panel">
        <h2>Saved Meals</h2>
        {savedMeals.length === 0 ? (
          <p>No saved meals yet</p>
        ) : (
          <table className="foods-table">
            <thead>
              <tr>
                <th>
                  <button
                    className="table-sort"
                    onClick={() => toggleSavedMealsSort("name")}
                    type="button"
                  >
                    Name{getSavedMealsSortIndicator("name")}
                  </button>
                </th>
                <th>
                  <button
                    className="table-sort"
                    onClick={() => toggleSavedMealsSort("ingredients")}
                    type="button"
                  >
                    Ingredients{getSavedMealsSortIndicator("ingredients")}
                  </button>
                </th>
                <th>
                  <button
                    className="table-sort"
                    onClick={() => toggleSavedMealsSort("totalCalories")}
                    type="button"
                  >
                    Total kcal{getSavedMealsSortIndicator("totalCalories")}
                  </button>
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedSavedMeals.map((meal) => (
                <tr key={meal.id}>
                  <td>{meal.name}</td>
                  <td>{meal.items.length}</td>
                  <td>{getMealTotalCalories(meal).toFixed(1)}</td>
                  <td className="inline-actions">
                    <button
                      onClick={() => openEditMealModal(meal)}
                      type="button"
                    >
                      Edit
                    </button>
                    <button
                      className="button-danger"
                      onClick={() => handleDeleteSavedMeal(meal.id)}
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

      <dialog className="crud-modal" ref={mealDialogRef}>
        <h3>{modalMode === "edit" ? "Edit Meal" : "Add Meal"}</h3>
        <label className="modal-field">
          Meal name
          <input
            placeholder="e.g. High-protein lunch"
            type="text"
            value={mealNameInput}
            onChange={(event) => setMealNameInput(event.target.value)}
          />
        </label>
        <form className="food-form" onSubmit={handleAddMealItem}>
          <label>
            Food item
            <select
              value={selectedFoodId}
              onChange={(event) => setSelectedFoodId(event.target.value)}
            >
              {foods.map((food) => (
                <option key={food.id} value={food.id}>
                  {food.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Quantity consumed
            <input
              min="0.1"
              step="0.1"
              type="number"
              value={quantityInput}
              onChange={(event) => setQuantityInput(event.target.value)}
            />
          </label>
          <button type="submit">Add ingredient</button>
        </form>

        {draftItems.length === 0 ? (
          <p>No ingredients added yet</p>
        ) : (
          <table className="foods-table">
            <thead>
              <tr>
                <th>
                  <button
                    className="table-sort"
                    onClick={() => toggleDraftItemsSort("food")}
                    type="button"
                  >
                    Food{getDraftItemsSortIndicator("food")}
                  </button>
                </th>
                <th>
                  <button
                    className="table-sort"
                    onClick={() => toggleDraftItemsSort("quantity")}
                    type="button"
                  >
                    Quantity{getDraftItemsSortIndicator("quantity")}
                  </button>
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedDraftItems.map((item) => (
                <tr key={item.id}>
                  <td>{getFoodItemName(item.foodItemId)}</td>
                  <td>{item.consumedQuantity}</td>
                  <td>
                    <button
                      onClick={() => handleRemoveMealItem(item.id)}
                      type="button"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="modal-actions">
          <button className="modal-cancel" onClick={closeMealModal}>
            Cancel
          </button>
          <button
            className="modal-confirm"
            disabled={!canPersistDraft}
            onClick={() => {
              void handlePersistMealFromModal();
            }}
          >
            {modalMode === "edit" ? "Update meal" : "Create meal"}
          </button>
        </div>
      </dialog>
    </div>
  );
}
