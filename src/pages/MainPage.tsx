import { useEffect, useState } from "react";
import { useToast } from "../components/ui/use-toast";
import { Badge } from "../components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "../components/ui/card";

interface Request {
  id: number;
  title: string;
  description: string;
  category: string;
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

const categoryMap: Record<string, string> = {
  roads: 'Дороги',
  landscaping: 'Благоустройство',
  lighting: 'Освещение',
  other: 'Другое'
};

const MainPage = () => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<number>(0);
  const { toast } = useToast();

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await fetch('http://localhost:4200/requests/get_all');
        if (!response.ok) {
          throw new Error('Ошибка при получении заявок');
        }
        const data = await response.json();
        const completed = data.filter((request: Request) => request.status === 'completed').length;
        setRequests(data);
        setStats(completed);
      } catch (error) {
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить заявки",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequests();
  }, [toast]);

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Загрузка...</div>;
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold mb-6">Заявки жителей</h1>
      <p className="text-sm text-gray-500 mb-4">Всего решенных заявок: {stats}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {requests.map((request) => (
          <Card key={request.id} className="flex flex-col">
            <CardHeader className="flex-none">
              <div className="flex justify-between items-center mb-2">
                <Badge variant="outline" className="mt-1">
                {categoryMap[request.category] || request.category}
              </Badge>
                <Badge >
                {new Date(request.date).toLocaleDateString('ru-RU', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  })}
                </Badge>
                
              
              </div>
              <h3 className="font-semibold text-lg">{request.title}</h3>
            </CardHeader>

            <CardContent className="flex-grow">
              {request.photoUrl && (
                <div className="mb-4">
                  <img 
                    src={request.photoUrl} 
                    alt={request.title}
                    className="w-full h-48 object-cover rounded-md"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder-image.jpg'; // Замените на путь к вашему placeholder изображению
                    }}
                  />
                </div>
              )}
            </CardContent>

          </Card>
        ))}
      </div>
    </div>
  );
};

export default MainPage; 