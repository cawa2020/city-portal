import { useEffect, useState } from "react";
import { useUser } from "../context/UserContext";
import { useToast } from "../components/ui/use-toast";
import { Card, CardContent, CardFooter, CardHeader } from "../components/ui/card";
import { Button } from "../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";

interface Request {
  id: number;
  title: string;
  description: string;
  category: {id: string, name: string};
  status: string;
  photoUrl: string | null;
  date: string;
}

const statusMap: Record<string, { label: string; className: string }> = {
  new: { label: 'Новая', className: 'bg-blue-500 hover:bg-blue-600' },
  inProgress: { label: 'В работе', className: 'bg-yellow-500 hover:bg-yellow-600' },
  completed: { label: 'Выполнена', className: 'bg-green-500 hover:bg-green-600' },
  rejected: { label: 'Отклонена', className: 'bg-red-500 hover:bg-red-600' }
};

const MyRequestsPage = () => {
  const { user } = useUser();
  const [requests, setRequests] = useState<Request[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<Request[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [deleteRequestId, setDeleteRequestId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [categoryMap, setCategoryMap] = useState<{id: string, name: string}[]>([]);

  useEffect(() => {
    const fetchCategoryMap = async () => {
      const response = await fetch('http://localhost:4200/categories');
      const data = await response.json();
      console.log(data);
      setCategoryMap(data);
    };

    const fetchMyRequests = async () => {
      if (!user?.id) return;

      try {
        const response = await fetch(`http://localhost:4200/requests/my?userId=${user.id}`);
        if (!response.ok) {
          throw new Error('Ошибка при получении заявок');
        }
        const data = await response.json();
        setRequests(data);
        setFilteredRequests(data);
      } catch (error) {
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить ваши заявки",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyRequests();
    fetchCategoryMap();
  }, [user]);

  useEffect(() => {
    let result = [...requests];

    if (statusFilter !== 'all') {
      result = result.filter(request => request.status === statusFilter);
    }

    if (categoryFilter !== 'all') {
      result = result.filter(request => request.category.name === categoryFilter);
    }

    setFilteredRequests(result);
  }, [statusFilter, categoryFilter, requests]);

  const handleDeleteRequest = async (requestId: number) => {
    try {
      const response = await fetch(`http://localhost:4200/requests/${requestId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Ошибка при удалении заявки');
      }

      setRequests(requests.filter(request => request.id !== requestId));
      setDeleteRequestId(null);
      
      toast({
        title: "Успешно",
        description: "Заявка удалена",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить заявку",
        variant: "destructive",
      });
    }
  };

  const openDeleteDialog = (requestId: number) => {
    setDeleteRequestId(requestId);
  };

  const closeDeleteDialog = () => {
    setDeleteRequestId(null);
  };

  const clearFilters = () => {
    setStatusFilter('all');
    setCategoryFilter('all');
  };

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Загрузка...</div>;
  }

  if (requests.length === 0) {
    return (
      <div className="container mx-auto py-6 px-4">
        <h1 className="text-2xl font-bold mb-6">Мои заявки</h1>
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">У вас пока нет заявок</p>
          <Button asChild>
            <a href="/main">Вернуться на главную</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold mb-6">Мои заявки</h1>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <SelectTrigger>
              <SelectValue placeholder="Фильтр по статусу" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все статусы</SelectItem>
              {Object.entries(statusMap).map(([value, { label }]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1">
          <Select
            value={categoryFilter}
            onValueChange={setCategoryFilter}
          >
            <SelectTrigger>
              <SelectValue placeholder="Фильтр по категории" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все категории</SelectItem>
              {Object.entries(categoryMap).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button 
          variant="outline" 
          onClick={clearFilters}
          className="whitespace-nowrap"
        >
          Сбросить фильтры
        </Button>
      </div>

      {filteredRequests.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">Заявки не найдены</p>
          <Button variant="outline" onClick={clearFilters}>
            Сбросить фильтры
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {filteredRequests.map(request => (
            <Card key={request.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold">{request.title}</h3>
                  <span className={`px-2 py-1 rounded text-sm ${statusMap[request.status]?.className} text-white`}>
                    {statusMap[request.status]?.label}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500 mb-2">{request.description}</p>
                <p className="text-gray-500">Категория: {request.category.name}</p>
                <p className="text-gray-500">Дата создания: {new Date(request.date).toLocaleString()}</p>
                <p className="text-gray-500">Статус: {request.status}</p>
              </CardContent>
              {request.status === 'Новая' && (
                <CardFooter className="flex justify-between">
                  <Button 
                  variant="outline" 
                  onClick={() => openDeleteDialog(request.id)}
                >
                  Удалить
                </Button>
                </CardFooter>
              )}
            </Card>
          ))}
        </div>
      )}
      
      <Button asChild>
        <a href="/main">Вернуться на главную</a>
      </Button>

      <Dialog open={deleteRequestId !== null} onOpenChange={closeDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Подтверждение удаления</DialogTitle>
            <DialogDescription>
              Вы действительно хотите удалить эту заявку? Это действие нельзя отменить.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={closeDeleteDialog}
            >
              Отмена
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteRequestId && handleDeleteRequest(deleteRequestId)}
            >
              Удалить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyRequestsPage; 