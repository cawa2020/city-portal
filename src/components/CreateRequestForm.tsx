import { useEffect, useState } from "react";
import { useUser } from "../context/UserContext";
import { useToast } from "./ui/use-toast";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

const CreateRequestForm = () => {
  const { user } = useUser();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [categoryMap, setCategoryMap] = useState<{ id: string, name: string }[]>([]);

  useEffect(() => {
    const fetchCategoryMap = async () => {
      const response = await fetch('http://localhost:4200/categories');
      const data = await response.json();
      console.log(data);
      setCategoryMap(data);
    };

    fetchCategoryMap()
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const requestData = {
        title: formData.get('title'),
        description: formData.get('description'),
        category: formData.get('category'),
        photoUrl: formData.get('photoUrl') || '',
        userId: user?.id
      };

      const response = await fetch('http://localhost:4200/requests/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка при создании заявки');
      }

      toast({
        title: "Заявка создана",
        description: "Ваша заявка успешно отправлена",
        variant: "default",
      });

      window.location.reload()
    } catch (error) {
      toast({
        title: "Ошибка",
        description: error instanceof Error ? error.message : 'Произошла ошибка при создании заявки',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-6">Создание заявки</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Заголовок заявки</Label>
            <Input
              id="title"
              name="title"
              placeholder="Введите заголовок заявки"
              required
            />
          </div>

          <div>
            <Label htmlFor="category">Категория</Label>
            <Select name="category" required>
              <SelectTrigger>
                <SelectValue placeholder="Выберите категорию" />
              </SelectTrigger>
              <SelectContent>
                {categoryMap.map((el) => 
                  <SelectItem value={el.name}>{el.name}</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">Описание проблемы</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Подробно опишите проблему"
              className="min-h-[150px]"
              required
            />
          </div>

          <div>
            <Label htmlFor="photoUrl">Ссылка на фото</Label>
            <Input
              id="photoUrl"
              name="photoUrl"
              type="url"
              placeholder="https://example.com/photo.jpg"
            />
            <p className="text-sm text-gray-500 mt-1">
              Вставьте ссылку на фотографию
            </p>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? "Создание..." : "Создать заявку"}
        </Button>
      </form>
    </div>
  );
};

export default CreateRequestForm;