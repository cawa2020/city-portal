import { useUser } from '../context/UserContext';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog"
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { useState } from 'react';
import { useToast } from "./ui/use-toast";
import { Toaster } from './ui/toaster';
import { Checkbox } from "./ui/checkbox"
import CreateRequestForm from './CreateRequestForm';

const Header = () => {
  const { user, login, logout } = useUser();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const loginData = {
        email: formData.get('email'),
        password: formData.get('password'),
      };

      const response = await fetch('http://localhost:4200/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка при входе');
      }

      // Используем контекст для сохранения данных пользователя
      login(data);
      
      toast({
        title: "Успешный вход",
        description: "Добро пожаловать!",
        variant: "default",
      });

    } catch (error) {
      toast({
        title: "Ошибка",
        description: error instanceof Error ? error.message : 'Произошла ошибка при входе',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const formData = new FormData(e.currentTarget);
    const privacyConsent = formData.get('privacy-consent');

    if (!privacyConsent) {
      toast({
        title: "Ошибка",
        description: "Необходимо согласие на обработку персональных данных",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const userData = {
        fullName: formData.get('fullName'),
        login: formData.get('login'),
        email: formData.get('email'),
        password: formData.get('password'),
      };

      if (userData.password !== formData.get('password-repeat')) {
        throw new Error('Пароли не совпадают');
      }

      const response = await fetch('http://localhost:4200/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка при регистрации');
      }

      // После успешной регистрации можно автоматически войти
      login(data);
      
      toast({
        title: "Успешная регистрация",
        description: "Вы успешно зарегистрированы и вошли в систему",
        variant: "default",
      });

    } catch (error) {
      toast({
        title: "Ошибка",
        description: error instanceof Error ? error.message : 'Произошла ошибка при регистрации',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <header>
      <Toaster />
      <div className="w-full px-6 py-4">
        <nav className="flex items-center justify-between">
          <img src="/logo.png" alt="logo" className="h-12" />
          <div className="flex items-center space-x-4">
            <a href="/">
              <Button>Главная</Button>
            </a>
            {user ? (
              <>
                <a href="/requests/my">
                  <Button>Мои заявки</Button>
                </a>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>Создать заявку</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    <CreateRequestForm />
                  </DialogContent>
                </Dialog>
                <Button onClick={logout}>Выйти</Button>
              </>
            ) : (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="default">Войти</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <Tabs defaultValue="login" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="login">Вход</TabsTrigger>
                      <TabsTrigger value="register">Регистрация</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="login">
                      <form onSubmit={handleLogin} className="space-y-4">
                        <div className="grid w-full items-center gap-4">
                          <div className="flex flex-col space-y-1.5">
                            <Label htmlFor="login-email">Email</Label>
                            <Input
                              id="login-email"
                              name="email"
                              type="email"
                              placeholder="name@example.com"
                              required
                            />
                          </div>
                          <div className="flex flex-col space-y-1.5">
                            <Label htmlFor="login-password">Пароль</Label>
                            <Input
                              id="login-password"
                              name="password"
                              type="password"
                              placeholder="Введите пароль"
                              required
                            />
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <Button 
                            type="submit" 
                            className="w-full"
                            disabled={isLoading}
                          >
                            {isLoading ? "Вход..." : "Войти"}
                          </Button>
                        </div>
                      </form>
                    </TabsContent>

                    <TabsContent value="register">
                      <form onSubmit={handleRegister} className="space-y-4">
                        <div className="grid w-full items-center gap-4">
                          <div className="flex flex-col space-y-1.5">
                            <Label htmlFor="fullName">ФИО</Label>
                            <Input
                              id="fullName"
                              name="fullName"
                              placeholder="Иванов Иван Иванович"
                              pattern="[А-Яа-яЁё\s\-]+"
                              required
                            />
                          </div>
                          <div className="flex flex-col space-y-1.5">
                            <Label htmlFor="login">Логин</Label>
                            <Input
                              id="login"
                              name="login"
                              placeholder="username"
                              pattern="[A-Za-z]+"
                              required
                            />
                          </div>
                          <div className="flex flex-col space-y-1.5">
                            <Label htmlFor="register-email">Email</Label>
                            <Input
                              id="register-email"
                              name="email"
                              type="email"
                              placeholder="name@example.com"
                              required
                            />
                          </div>
                          <div className="flex flex-col space-y-1.5">
                            <Label htmlFor="register-password">Пароль</Label>
                            <Input
                              id="register-password"
                              name="password"
                              type="password"
                              placeholder="Введите пароль"
                              required
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="privacy-consent" 
                              name="privacy-consent"
                              required
                            />
                            <Label 
                              htmlFor="privacy-consent" 
                              className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              Я согласен на обработку персональных данных
                            </Label>
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <Button 
                            type="submit" 
                            className="w-full"
                            disabled={isLoading}
                          >
                            {isLoading ? "Регистрация..." : "Зарегистрироваться"}
                          </Button>
                        </div>
                      </form>
                    </TabsContent>
                  </Tabs>
                </DialogContent>
              </Dialog>
              )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header; 