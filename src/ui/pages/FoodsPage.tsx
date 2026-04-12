import { useEffect, useState } from "react";

import type { CompositionRoot } from "../../application/composition";
import { DomainError } from "../../domain/errors";
import type { FoodItem } from "../../domain/models";
import { FoodForm, type FoodFormValues } from "../components/FoodForm";
import { FoodsTable } from "../components/FoodsTable";

interface FoodsPageProps {
  composition: CompositionRoot;
}

export function FoodsPage({ composition }: FoodsPageProps) {
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [status, setStatus] = useState<string>("");
  const [isError, setIsError] = useState(false);

  async function refreshFoods() {
    const nextFoods = await composition.listFoodItems();
    setFoods(nextFoods);
  }

  useEffect(() => {
    void refreshFoods();
  }, []);

  async function handleCreateFood(values: FoodFormValues): Promise<boolean> {
    try {
      const food: FoodItem = {
        id: `food-${Date.now()}`,
        ...values,
      };

      await composition.createFoodItem(food);
      setStatus("Food added!");
      setIsError(false);
      await refreshFoods();
      return true;
    } catch (error) {
      const message =
        error instanceof DomainError
          ? `${error.code}: ${error.message}`
          : String(error);
      setStatus(message);
      setIsError(true);
      return false;
    }
  }

  async function handleDeleteFood(id: string): Promise<void> {
    await composition.deleteFoodItem(id);
    await refreshFoods();
  }

  return (
    <div className="foods-page">
      <FoodForm onSubmit={handleCreateFood} />
      <p className={isError ? "status status--error" : "status"}>{status}</p>
      <FoodsTable foods={foods} onDelete={handleDeleteFood} />
    </div>
  );
}
