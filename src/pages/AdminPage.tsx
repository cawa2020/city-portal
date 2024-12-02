import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useToast } from '../components/ui/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';

interface Category {
  id: number;
  name: string;
}

interface Request {
  id: number;
  title: string;
  status: string;
  date: string;
}

const AdminPage = () => {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Загрузка категорий и заявок
  useEffect(() => {
    fetchCategories();
    fetchRequests();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:4200/categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить категории",
        variant: "destructive",
      });
    }
  };

  const fetchRequests = async () => {
    try {
      const response = await fetch('http://localhost:4200/requests/get_all');
      const data = await response.json();
      setRequests(data);
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить заявки",
        variant: "destructive",
      });
    }
  };

  // Создание новой категории
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:4200/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newCategory }),
      });

      if (!response.ok) throw new Error('Ошибка при создании категории');

      toast({
        title: "Успешно",
        description: "Категория создана",
      });

      setNewCategory('');
      fetchCategories();
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось создать категорию",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Обновление статуса заявки
  const handleStatusChange = async (requestId: number, newStatus: string) => {
    try {
      const response = await fetch(`http://localhost:4200/requests/${requestId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Ошибка при обновлении статуса');

      toast({
        title: "Успешно",
        description: "Статус заявки обновлен",
      });

      fetchRequests();
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить статус",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Панель администратора</h1>

      {/* Секция создания категории */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Создать категорию</h2>
        <form onSubmit={handleCreateCategory} className="flex gap-4">
          <Input
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="Название категории"
            required
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Создание..." : "Создать"}
          </Button>
        </form>
      </div>

      {/* Таблица заявок */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Управление заявками</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Название</TableHead>
              <TableHead>Дата создания</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((request) => (
              <TableRow key={request.id}>
                <TableCell>{request.id}</TableCell>
                <TableCell>{request.title}</TableCell>
                <TableCell>{new Date(request.date).toLocaleDateString()}</TableCell>
                <TableCell>{request.status}</TableCell>
                <TableCell>
                  <Select
                    onValueChange={(value) => handleStatusChange(request.id, value)}
                    defaultValue={request.status}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Выберите статус" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">Новая</SelectItem>
                      <SelectItem value="completed">Завершена</SelectItem>
                      <SelectItem value="rejected">Отклонена</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminPage; 