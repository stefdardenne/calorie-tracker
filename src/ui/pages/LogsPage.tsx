import { useEffect, useMemo, useRef, useState } from "react";

import type { CompositionRoot } from "../../application/composition";
import { DomainError } from "../../domain/errors";
import type { FoodItem, LogEntry, Meal, MealType } from "../../domain/models";
import { calculateLoggedNutrition } from "../../domain/rules/nutrition/nutrition";

interface LogsPageProps {
  composition: CompositionRoot;
}

const MEAL_TYPES: MealType[] = ["breakfast", "lunch", "dinner", "snacks"];
const ALL_MEAL_TYPES_FILTER = "all";
type SortDirection = "asc" | "desc";
type LogSortKey =
  | "food"
  | "mealType"
  | "quantity"
  | "carbs"
  | "protein"
  | "fat"
  | "calories";

export function LogsPage({ composition }: LogsPageProps) {
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });

  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);
  const [status, setStatus] = useState<string>("");
  const [isError, setIsError] = useState(false);

  // Food log form state
  const [selectedFoodId, setSelectedFoodId] = useState<string>("");
  const [foodQuantity, setFoodQuantity] = useState<string>("100");
  const [foodMealType, setFoodMealType] = useState<MealType>("lunch");
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  const [editFoodId, setEditFoodId] = useState<string>("");
  const [editQuantity, setEditQuantity] = useState<string>("100");
  const [editMealType, setEditMealType] = useState<MealType>("lunch");

  // Meal log form state
  const [selectedMealId, setSelectedMealId] = useState<string>("");
  const [mealMealType, setMealMealType] = useState<MealType>("lunch");

  // Sorting state
  const [sortKey, setSortKey] = useState<LogSortKey>("mealType");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [mealTypeFilter, setMealTypeFilter] = useState<MealType | "all">(
    ALL_MEAL_TYPES_FILTER,
  );
  const [foodSearchQuery, setFoodSearchQuery] = useState("");

  const foodLogDialogRef = useRef<HTMLDialogElement | null>(null);
  const mealLogDialogRef = useRef<HTMLDialogElement | null>(null);
  const editLogDialogRef = useRef<HTMLDialogElement | null>(null);

  useEffect(() => {
    async function loadPageData() {
      const nextFoods = await composition.listFoodItems();
      setFoods(nextFoods);
      if (nextFoods.length > 0) {
        setSelectedFoodId(nextFoods[0].id);
      }

      const nextMeals = await composition.listMeals();
      setMeals(nextMeals);
      if (nextMeals.length > 0) {
        setSelectedMealId(nextMeals[0].id);
      }

      await refreshLogsForDate(selectedDate);
    }

    void loadPageData();
  }, [composition, selectedDate]);

  async function refreshLogsForDate(dateStr: string): Promise<void> {
    const date = new Date(`${dateStr}T00:00:00Z`);
    const entries = await composition.listLogEntriesForDay(date);
    setLogEntries(entries);
  }

  function openFoodLogModal(): void {
    setFoodQuantity("100");
    setFoodMealType("lunch");
    foodLogDialogRef.current?.showModal();
  }

  function closeFoodLogModal(): void {
    foodLogDialogRef.current?.close();
  }

  function openMealLogModal(): void {
    setMealMealType("lunch");
    mealLogDialogRef.current?.showModal();
  }

  function closeMealLogModal(): void {
    mealLogDialogRef.current?.close();
  }

  function openEditLogModal(entry: LogEntry): void {
    setEditingLogId(entry.id);
    setEditFoodId(entry.foodItemId);
    setEditQuantity(String(entry.consumedQuantity));
    setEditMealType(entry.mealType);
    editLogDialogRef.current?.showModal();
  }

  function closeEditLogModal(): void {
    editLogDialogRef.current?.close();
  }

  async function handleLogFoodItem(): Promise<void> {
    try {
      const quantity = Number(foodQuantity);
      if (!selectedFoodId) {
        throw new DomainError("INVALID_FOOD_ITEM_NAME", "Select a food item");
      }
      if (!Number.isFinite(quantity) || quantity <= 0) {
        throw new DomainError(
          "INVALID_CONSUMED_QUANTITY",
          "Quantity must be greater than 0",
        );
      }

      const selectedFood = foods.find((f) => f.id === selectedFoodId);
      if (!selectedFood) {
        throw new DomainError(
          "INVALID_FOOD_ITEM_NAME",
          "Selected food no longer exists",
        );
      }

      const logEntry: LogEntry = {
        id: `log-${Date.now()}`,
        foodItemId: selectedFoodId,
        consumedQuantity: quantity,
        occurredAt: `${selectedDate}T12:00:00Z` as const,
        mealType: foodMealType,
      };

      await composition.logFoodItem(logEntry);
      setStatus("Food item logged");
      setIsError(false);
      await refreshLogsForDate(selectedDate);
      closeFoodLogModal();
    } catch (error) {
      const message =
        error instanceof DomainError
          ? `${error.code}: ${error.message}`
          : String(error);
      setStatus(message);
      setIsError(true);
    }
  }

  async function handleLogMeal(): Promise<void> {
    try {
      if (!selectedMealId) {
        throw new DomainError("INVALID_MEAL_NAME", "Select a meal");
      }

      const selectedMeal = meals.find((m) => m.id === selectedMealId);
      if (!selectedMeal) {
        throw new DomainError(
          "INVALID_MEAL_NAME",
          "Selected meal no longer exists",
        );
      }

      const selectedDateObj = new Date(`${selectedDate}T00:00:00Z`);
      await composition.logMeal(selectedMeal, selectedDateObj, mealMealType);

      setStatus("Meal logged");
      setIsError(false);
      await refreshLogsForDate(selectedDate);
      closeMealLogModal();
    } catch (error) {
      const message =
        error instanceof DomainError
          ? `${error.code}: ${error.message}`
          : String(error);
      setStatus(message);
      setIsError(true);
    }
  }

  async function handleUpdateLog(): Promise<void> {
    try {
      if (!editingLogId) {
        return;
      }

      const original = logEntries.find((entry) => entry.id === editingLogId);
      if (!original) {
        throw new DomainError("INVALID_FOOD_ITEM_NAME", "Log entry not found");
      }

      const quantity = Number(editQuantity);
      if (!Number.isFinite(quantity) || quantity <= 0) {
        throw new DomainError(
          "INVALID_CONSUMED_QUANTITY",
          "Quantity must be greater than 0",
        );
      }

      const updatedEntry: LogEntry = {
        ...original,
        foodItemId: editFoodId,
        consumedQuantity: quantity,
        mealType: editMealType,
      };

      await composition.updateLogEntry(updatedEntry);
      await refreshLogsForDate(selectedDate);
      setStatus("Log entry updated");
      setIsError(false);
      closeEditLogModal();
      setEditingLogId(null);
    } catch (error) {
      const message =
        error instanceof DomainError
          ? `${error.code}: ${error.message}`
          : String(error);
      setStatus(message);
      setIsError(true);
    }
  }

  async function handleDeleteLog(entryId: string): Promise<void> {
    await composition.deleteLogEntry(entryId);
    await refreshLogsForDate(selectedDate);
    setStatus("Log entry deleted");
    setIsError(false);
  }

  function getFoodName(foodItemId: string): string {
    return foods.find((f) => f.id === foodItemId)?.name || "Unknown food";
  }

  function getLoggedNutrition(entry: LogEntry): {
    calories: number;
    carbs: number;
    protein: number;
    fat: number;
  } {
    const food = foods.find((f) => f.id === entry.foodItemId);
    if (!food) return { calories: 0, carbs: 0, protein: 0, fat: 0 };

    try {
      const nutrition = calculateLoggedNutrition(food, entry);
      return {
        calories: nutrition.calories,
        carbs: nutrition.carbohydrates,
        protein: nutrition.proteins,
        fat: nutrition.fats,
      };
    } catch {
      return { calories: 0, carbs: 0, protein: 0, fat: 0 };
    }
  }

  const filteredLogEntries = useMemo(() => {
    const normalizedSearch = foodSearchQuery.trim().toLowerCase();

    return logEntries.filter((entry) => {
      const mealTypeMatches =
        mealTypeFilter === ALL_MEAL_TYPES_FILTER ||
        entry.mealType === mealTypeFilter;

      const foodName = getFoodName(entry.foodItemId).toLowerCase();
      const searchMatches =
        normalizedSearch.length === 0 || foodName.includes(normalizedSearch);

      return mealTypeMatches && searchMatches;
    });
  }, [foodSearchQuery, logEntries, mealTypeFilter, foods]);

  const sortedLogEntries = useMemo(() => {
    const sorted = [...filteredLogEntries];
    sorted.sort((left, right) => {
      const directionMultiplier = sortDirection === "asc" ? 1 : -1;

      if (sortKey === "food") {
        return (
          getFoodName(left.foodItemId).localeCompare(
            getFoodName(right.foodItemId),
          ) * directionMultiplier
        );
      }

      if (sortKey === "mealType") {
        return (
          left.mealType.localeCompare(right.mealType) * directionMultiplier
        );
      }

      if (sortKey === "quantity") {
        return (
          (left.consumedQuantity - right.consumedQuantity) * directionMultiplier
        );
      }

      const leftNutrition = getLoggedNutrition(left);
      const rightNutrition = getLoggedNutrition(right);

      if (sortKey === "carbs") {
        return (
          (leftNutrition.carbs - rightNutrition.carbs) * directionMultiplier
        );
      }
      if (sortKey === "protein") {
        return (
          (leftNutrition.protein - rightNutrition.protein) * directionMultiplier
        );
      }
      if (sortKey === "fat") {
        return (leftNutrition.fat - rightNutrition.fat) * directionMultiplier;
      }
      if (sortKey === "calories") {
        return (
          (leftNutrition.calories - rightNutrition.calories) *
          directionMultiplier
        );
      }

      return 0;
    });
    return sorted;
  }, [filteredLogEntries, sortDirection, sortKey, foods]);

  function toggleSort(column: LogSortKey): void {
    if (sortKey === column) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(column);
    setSortDirection("asc");
  }

  function getSortIndicator(column: LogSortKey): string {
    if (sortKey !== column) {
      return "";
    }
    return sortDirection === "asc" ? " \u2191" : " \u2193";
  }

  const totalCalories = sortedLogEntries.reduce(
    (sum, entry) => sum + getLoggedNutrition(entry).calories,
    0,
  );

  if (foods.length === 0 || meals.length === 0) {
    return (
      <section className="panel">
        <h2>Log Meals</h2>
        <p>Create at least one food item and meal before logging.</p>
      </section>
    );
  }

  return (
    <div className="foods-page">
      <section className="panel">
        <div className="meals-toolbar">
          <h2>Logs for {selectedDate}</h2>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{
                padding: "0.65rem 0.75rem",
                border: "1px solid #bcccdc",
                borderRadius: "0.5rem",
                background: "#fff",
              }}
            />
            <button onClick={openFoodLogModal} type="button">
              Log food
            </button>
            <button onClick={openMealLogModal} type="button">
              Log meal
            </button>
          </div>
        </div>
      </section>

      <p className={isError ? "status status--error" : "status"}>{status}</p>

      <section className="panel">
        <h2>Logged Items</h2>
        <div className="logs-filters">
          <label>
            Meal type
            <select
              value={mealTypeFilter}
              onChange={(event) =>
                setMealTypeFilter(event.target.value as MealType | "all")
              }
            >
              <option value={ALL_MEAL_TYPES_FILTER}>All</option>
              {MEAL_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </label>
          <label>
            Search food
            <input
              type="text"
              value={foodSearchQuery}
              onChange={(event) => setFoodSearchQuery(event.target.value)}
              placeholder="e.g. chicken"
            />
          </label>
        </div>
        <p>Total: {totalCalories.toFixed(0)} kcal</p>

        {sortedLogEntries.length === 0 ? (
          <p>No items logged for this date</p>
        ) : (
          <table className="foods-table">
            <thead>
              <tr>
                <th>
                  <button
                    className="table-sort"
                    onClick={() => toggleSort("food")}
                    type="button"
                  >
                    Food{getSortIndicator("food")}
                  </button>
                </th>
                <th>
                  <button
                    className="table-sort"
                    onClick={() => toggleSort("mealType")}
                    type="button"
                  >
                    Meal Type{getSortIndicator("mealType")}
                  </button>
                </th>
                <th>
                  <button
                    className="table-sort"
                    onClick={() => toggleSort("quantity")}
                    type="button"
                  >
                    Quantity{getSortIndicator("quantity")}
                  </button>
                </th>
                <th>
                  <button
                    className="table-sort"
                    onClick={() => toggleSort("carbs")}
                    type="button"
                  >
                    Carbs{getSortIndicator("carbs")}
                  </button>
                </th>
                <th>
                  <button
                    className="table-sort"
                    onClick={() => toggleSort("protein")}
                    type="button"
                  >
                    Protein{getSortIndicator("protein")}
                  </button>
                </th>
                <th>
                  <button
                    className="table-sort"
                    onClick={() => toggleSort("fat")}
                    type="button"
                  >
                    Fat{getSortIndicator("fat")}
                  </button>
                </th>
                <th>
                  <button
                    className="table-sort"
                    onClick={() => toggleSort("calories")}
                    type="button"
                  >
                    kcal{getSortIndicator("calories")}
                  </button>
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedLogEntries.map((entry) => {
                const nutrition = getLoggedNutrition(entry);
                return (
                  <tr key={entry.id}>
                    <td>{getFoodName(entry.foodItemId)}</td>
                    <td>
                      {entry.mealType.charAt(0).toUpperCase() +
                        entry.mealType.slice(1)}
                    </td>
                    <td>{entry.consumedQuantity}</td>
                    <td>{nutrition.carbs.toFixed(1)}g</td>
                    <td>{nutrition.protein.toFixed(1)}g</td>
                    <td>{nutrition.fat.toFixed(1)}g</td>
                    <td>{nutrition.calories.toFixed(1)}</td>
                    <td className="inline-actions">
                      <button
                        onClick={() => openEditLogModal(entry)}
                        type="button"
                      >
                        Edit
                      </button>
                      <button
                        className="button-danger"
                        onClick={() => {
                          void handleDeleteLog(entry.id);
                        }}
                        type="button"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>

      <dialog className="crud-modal" ref={foodLogDialogRef}>
        <h3>Log Food Item</h3>
        <label className="modal-field">
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
        <label className="modal-field">
          Quantity
          <input
            min="0.1"
            step="0.1"
            type="number"
            value={foodQuantity}
            onChange={(event) => setFoodQuantity(event.target.value)}
          />
        </label>
        <label className="modal-field">
          Meal type
          <select
            value={foodMealType}
            onChange={(event) =>
              setFoodMealType(event.target.value as MealType)
            }
          >
            {MEAL_TYPES.map((type) => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </label>
        <div className="modal-actions">
          <button className="modal-cancel" onClick={closeFoodLogModal}>
            Cancel
          </button>
          <button
            className="modal-confirm"
            onClick={() => {
              void handleLogFoodItem();
            }}
          >
            Log food item
          </button>
        </div>
      </dialog>

      <dialog className="crud-modal" ref={mealLogDialogRef}>
        <h3>Log Meal</h3>
        <label className="modal-field">
          Saved meal
          <select
            value={selectedMealId}
            onChange={(event) => setSelectedMealId(event.target.value)}
          >
            {meals.map((meal) => (
              <option key={meal.id} value={meal.id}>
                {meal.name}
              </option>
            ))}
          </select>
        </label>
        <label className="modal-field">
          Meal type
          <select
            value={mealMealType}
            onChange={(event) =>
              setMealMealType(event.target.value as MealType)
            }
          >
            {MEAL_TYPES.map((type) => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </label>
        <div className="modal-actions">
          <button className="modal-cancel" onClick={closeMealLogModal}>
            Cancel
          </button>
          <button
            className="modal-confirm"
            onClick={() => {
              void handleLogMeal();
            }}
          >
            Log meal
          </button>
        </div>
      </dialog>

      <dialog className="crud-modal" ref={editLogDialogRef}>
        <h3>Edit Log Entry</h3>
        <label className="modal-field">
          Food item
          <select
            value={editFoodId}
            onChange={(event) => setEditFoodId(event.target.value)}
          >
            {foods.map((food) => (
              <option key={food.id} value={food.id}>
                {food.name}
              </option>
            ))}
          </select>
        </label>
        <label className="modal-field">
          Quantity
          <input
            min="0.1"
            step="0.1"
            type="number"
            value={editQuantity}
            onChange={(event) => setEditQuantity(event.target.value)}
          />
        </label>
        <label className="modal-field">
          Meal type
          <select
            value={editMealType}
            onChange={(event) =>
              setEditMealType(event.target.value as MealType)
            }
          >
            {MEAL_TYPES.map((type) => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </label>
        <div className="modal-actions">
          <button className="modal-cancel" onClick={closeEditLogModal}>
            Cancel
          </button>
          <button
            className="modal-confirm"
            onClick={() => {
              void handleUpdateLog();
            }}
          >
            Update log
          </button>
        </div>
      </dialog>
    </div>
  );
}
