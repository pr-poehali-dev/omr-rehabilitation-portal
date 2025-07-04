import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import Icon from "@/components/ui/icon";

interface User {
  id: string;
  email: string;
  name: string;
  rank: string;
  department: string;
  experience: string;
  isAdmin: boolean;
  isDepartmentHead: boolean;
  completedTasks: number[];
  pendingTasks: number[];
  points: number;
  notifications: Notification[];
}

interface Task {
  id: number;
  title: string;
  description: string;
  assignedTo: string | null;
  completed: boolean;
  points: number;
  department: string;
  createdBy: string;
}

interface Notification {
  id: number;
  message: string;
  timestamp: string;
  read: boolean;
  type: "system" | "task" | "message";
  from?: string;
}

interface Department {
  id: string;
  name: string;
  head: string;
  members: string[];
}

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showPoints, setShowPoints] = useState(false);
  const [showMessaging, setShowMessaging] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [messageText, setMessageText] = useState("");

  // Данные системы
  const [users, setUsers] = useState<Record<string, User>>({
    "admin@omr.ru": {
      id: "OMR-SUPER",
      email: "admin@omr.ru",
      name: "Главный Администратор",
      rank: "Генерал-лейтенант",
      department: "Высшее командование",
      experience: "15 лет",
      isAdmin: true,
      isDepartmentHead: true,
      completedTasks: [1, 2],
      pendingTasks: [],
      points: 150,
      notifications: [
        {
          id: 1,
          message: "Добро пожаловать в систему ОМР",
          timestamp: "09:00",
          read: false,
          type: "system",
        },
        {
          id: 2,
          message: "Новое задание от отдела безопасности",
          timestamp: "10:30",
          read: false,
          type: "task",
        },
      ],
    },
    "security@omr.ru": {
      id: "OMR-SEC-01",
      email: "security@omr.ru",
      name: "Начальник Безопасности",
      rank: "Полковник",
      department: "Отдел безопасности",
      experience: "8 лет",
      isAdmin: false,
      isDepartmentHead: true,
      completedTasks: [3],
      pendingTasks: [],
      points: 85,
      notifications: [
        {
          id: 3,
          message: "Проверка периметра завершена",
          timestamp: "11:00",
          read: false,
          type: "task",
        },
      ],
    },
    "agent@omr.ru": {
      id: "OMR-AG-01",
      email: "agent@omr.ru",
      name: "Агент Смирнов",
      rank: "Капитан",
      department: "Отдел безопасности",
      experience: "3 года",
      isAdmin: false,
      isDepartmentHead: false,
      completedTasks: [],
      pendingTasks: [4],
      points: 25,
      notifications: [
        {
          id: 4,
          message: "Получено новое задание",
          timestamp: "12:00",
          read: false,
          type: "task",
        },
      ],
    },
  });

  const [userPasswords] = useState<Record<string, string>>({
    "admin@omr.ru": "OMRJVH1338",
    "security@omr.ru": "SEC2024",
    "agent@omr.ru": "AGENT123",
  });

  const [departments] = useState<Department[]>([
    {
      id: "command",
      name: "Высшее командование",
      head: "admin@omr.ru",
      members: ["admin@omr.ru"],
    },
    {
      id: "security",
      name: "Отдел безопасности",
      head: "security@omr.ru",
      members: ["security@omr.ru", "agent@omr.ru"],
    },
    { id: "analytics", name: "Отдел аналитики", head: "", members: [] },
  ]);

  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 1,
      title: "Патрулирование сектора A",
      description:
        "Осуществить обход территории и доложить о подозрительных активностях",
      assignedTo: null,
      completed: false,
      points: 15,
      department: "security",
      createdBy: "admin@omr.ru",
    },
    {
      id: 2,
      title: "Проверка систем безопасности",
      description:
        "Провести полную диагностику всех систем безопасности объекта",
      assignedTo: null,
      completed: false,
      points: 25,
      department: "security",
      createdBy: "security@omr.ru",
    },
    {
      id: 3,
      title: "Анализ отчетов",
      description: "Проанализировать недельные отчеты по безопасности",
      assignedTo: "agent@omr.ru",
      completed: false,
      points: 10,
      department: "security",
      createdBy: "security@omr.ru",
    },
  ]);

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    points: 0,
    department: "",
  });
  const [newUser, setNewUser] = useState({
    email: "",
    password: "",
    name: "",
    rank: "",
    department: "",
  });

  const handleLogin = () => {
    if (!email || !password) {
      setLoginError("Введите email и пароль");
      return;
    }

    if (!userPasswords[email] || userPasswords[email] !== password) {
      setLoginError("Неверные учетные данные");
      return;
    }

    setCurrentUser(users[email]);
    setIsAuthenticated(true);
    setLoginError("");
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    setEmail("");
    setPassword("");
    setShowAdminPanel(false);
    setShowCreateTask(false);
    setShowPoints(false);
    setShowMessaging(false);
  };

  const handleAcceptTask = (taskId: number) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId
          ? { ...task, assignedTo: currentUser?.id || "" }
          : task,
      ),
    );
  };

  const handleCreateTask = () => {
    if (!newTask.title || !newTask.description || !newTask.department) return;

    const task: Task = {
      id: Date.now(),
      title: newTask.title,
      description: newTask.description,
      assignedTo: null,
      completed: false,
      points: newTask.points,
      department: newTask.department,
      createdBy: currentUser?.email || "",
    };

    setTasks([...tasks, task]);
    setNewTask({ title: "", description: "", points: 0, department: "" });
    setShowCreateTask(false);
  };

  const handleSendMessage = () => {
    if (!messageText || !selectedUser) return;

    const notification: Notification = {
      id: Date.now(),
      message: `Сообщение от ${currentUser?.name}: ${messageText}`,
      timestamp: new Date().toLocaleTimeString(),
      read: false,
      type: "message",
      from: currentUser?.email,
    };

    setUsers((prev) => ({
      ...prev,
      [selectedUser]: {
        ...prev[selectedUser],
        notifications: [notification, ...prev[selectedUser].notifications],
      },
    }));

    setMessageText("");
    setSelectedUser("");
    setShowMessaging(false);
  };

  const getUserDepartment = (email: string) => {
    return departments.find((dept) => dept.members.includes(email));
  };

  const getSubordinates = (departmentHead: string) => {
    const dept = departments.find((d) => d.head === departmentHead);
    return dept
      ? dept.members.filter((member) => member !== departmentHead)
      : [];
  };

  const availableTasks = tasks.filter(
    (task) =>
      !task.assignedTo &&
      (!task.department ||
        task.department === getUserDepartment(currentUser?.email || "")?.id),
  );

  const myTasks = tasks.filter((task) => task.assignedTo === currentUser?.id);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                <Icon name="Shield" className="w-8 h-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900">
              ОМР Портал
            </CardTitle>
            <p className="text-slate-600">Организация Мировой Реабилитации</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Введите email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleLogin()}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                placeholder="Введите пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleLogin()}
              />
            </div>
            {loginError && (
              <div className="text-red-600 text-sm text-center">
                {loginError}
              </div>
            )}
            <Button
              onClick={handleLogin}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Войти в систему
            </Button>
            <div className="text-xs text-slate-500 text-center mt-4">
              <p>Демо-аккаунты:</p>
              <p>admin@omr.ru / OMRJVH1338</p>
              <p>security@omr.ru / SEC2024</p>
              <p>agent@omr.ru / AGENT123</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-blue-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Icon name="Shield" className="w-8 h-8" />
              <div>
                <h1 className="text-xl font-bold">ОМР</h1>
                <p className="text-blue-100 text-sm">
                  Организация Мировой Реабилитации
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPoints(true)}
                className="text-white hover:bg-blue-500"
              >
                <Icon name="Star" className="w-4 h-4 mr-1" />
                {currentUser?.points || 0}
              </Button>
              <span className="text-sm">{currentUser?.name}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-white hover:bg-blue-500"
              >
                <Icon name="LogOut" className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Icon name="User" className="w-5 h-5 mr-2" />
                  Профиль сотрудника
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                        <Icon name="User" className="w-8 h-8 text-slate-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{currentUser?.name}</h3>
                        <p className="text-slate-600">{currentUser?.rank}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p>
                        <span className="font-medium">ID:</span>{" "}
                        {currentUser?.id}
                      </p>
                      <p>
                        <span className="font-medium">Отдел:</span>{" "}
                        {currentUser?.department}
                      </p>
                      <p>
                        <span className="font-medium">Стаж:</span>{" "}
                        {currentUser?.experience}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-medium">Выполненные задания</h4>
                    <div className="space-y-2">
                      {currentUser?.completedTasks.slice(0, 3).map((taskId) => {
                        const task = tasks.find((t) => t.id === taskId);
                        return task ? (
                          <div
                            key={taskId}
                            className="flex items-center space-x-2"
                          >
                            <Icon
                              name="CheckCircle"
                              className="w-4 h-4 text-green-600"
                            />
                            <span className="text-sm">{task.title}</span>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              {(currentUser?.isAdmin || currentUser?.isDepartmentHead) && (
                <Button
                  onClick={() => setShowCreateTask(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Icon name="Plus" className="w-4 h-4 mr-2" />
                  Создать задание
                </Button>
              )}
              {currentUser?.isDepartmentHead && (
                <Button
                  onClick={() => setShowMessaging(true)}
                  variant="outline"
                >
                  <Icon name="MessageCircle" className="w-4 h-4 mr-2" />
                  Написать сотруднику
                </Button>
              )}
              {currentUser?.isAdmin && (
                <Button
                  onClick={() => setShowAdminPanel(true)}
                  variant="outline"
                >
                  <Icon name="Settings" className="w-4 h-4 mr-2" />
                  Админ панель
                </Button>
              )}
            </div>

            {/* Tasks Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Icon name="ClipboardList" className="w-5 h-5 mr-2" />
                  Задания
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="available" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="available">Доступные</TabsTrigger>
                    <TabsTrigger value="my">Мои задания</TabsTrigger>
                  </TabsList>
                  <TabsContent value="available" className="mt-4">
                    <div className="space-y-4">
                      {availableTasks.map((task) => (
                        <Card
                          key={task.id}
                          className="border-l-4 border-l-blue-500"
                        >
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h4 className="font-medium">{task.title}</h4>
                                <p className="text-slate-600 text-sm mt-1">
                                  {task.description}
                                </p>
                                <div className="flex items-center space-x-4 mt-2">
                                  <Badge variant="outline">
                                    {task.points} баллов
                                  </Badge>
                                  <span className="text-xs text-slate-500">
                                    {
                                      departments.find(
                                        (d) => d.id === task.department,
                                      )?.name
                                    }
                                  </span>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                onClick={() => handleAcceptTask(task.id)}
                              >
                                Принять
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                  <TabsContent value="my" className="mt-4">
                    <div className="space-y-4">
                      {myTasks.map((task) => (
                        <Card
                          key={task.id}
                          className="border-l-4 border-l-green-500"
                        >
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h4 className="font-medium">{task.title}</h4>
                                <p className="text-slate-600 text-sm mt-1">
                                  {task.description}
                                </p>
                                <Badge variant="outline" className="mt-2">
                                  {task.points} баллов
                                </Badge>
                              </div>
                              <div className="flex space-x-2">
                                <Button size="sm" variant="outline">
                                  Отчет
                                </Button>
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  Завершить
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Notifications */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Icon name="Bell" className="w-5 h-5 mr-2" />
                Уведомления
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {currentUser?.notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="p-3 bg-slate-50 rounded-lg"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm">{notification.message}</p>
                          <p className="text-xs text-slate-500 mt-1">
                            {notification.timestamp}
                          </p>
                        </div>
                        <Badge
                          variant={
                            notification.type === "message"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {notification.type === "message"
                            ? "Сообщение"
                            : notification.type === "task"
                              ? "Задание"
                              : "Система"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Modals */}

      {/* Create Task Modal */}
      <Dialog open={showCreateTask} onOpenChange={setShowCreateTask}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Создать новое задание</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="task-title">Название задания</Label>
              <Input
                id="task-title"
                value={newTask.title}
                onChange={(e) =>
                  setNewTask({ ...newTask, title: e.target.value })
                }
                placeholder="Введите название"
              />
            </div>
            <div>
              <Label htmlFor="task-desc">Описание</Label>
              <Textarea
                id="task-desc"
                value={newTask.description}
                onChange={(e) =>
                  setNewTask({ ...newTask, description: e.target.value })
                }
                placeholder="Введите описание"
              />
            </div>
            <div>
              <Label htmlFor="task-department">Отдел</Label>
              <Select
                value={newTask.department}
                onValueChange={(value) =>
                  setNewTask({ ...newTask, department: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите отдел" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="task-points">Баллы</Label>
              <Input
                id="task-points"
                type="number"
                value={newTask.points}
                onChange={(e) =>
                  setNewTask({ ...newTask, points: Number(e.target.value) })
                }
                placeholder="Количество баллов"
              />
            </div>
            <Button onClick={handleCreateTask} className="w-full">
              Создать задание
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Messaging Modal */}
      <Dialog open={showMessaging} onOpenChange={setShowMessaging}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Написать сотруднику</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="select-user">Выберите сотрудника</Label>
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите сотрудника" />
                </SelectTrigger>
                <SelectContent>
                  {getSubordinates(currentUser?.email || "").map(
                    (userEmail) => (
                      <SelectItem key={userEmail} value={userEmail}>
                        {users[userEmail]?.name} - {users[userEmail]?.rank}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="message-text">Сообщение</Label>
              <Textarea
                id="message-text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Введите сообщение"
              />
            </div>
            <Button onClick={handleSendMessage} className="w-full">
              Отправить сообщение
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Points Modal */}
      <Dialog open={showPoints} onOpenChange={setShowPoints}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ваши баллы</DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <div className="text-5xl font-bold text-green-600 mb-4">
              {currentUser?.points || 0}
            </div>
            <p className="text-slate-600">Накопленные баллы</p>
            <Separator className="my-4" />
            <p className="text-sm text-slate-500">
              Баллы начисляются за выполнение заданий
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Admin Panel Modal */}
      <Dialog open={showAdminPanel} onOpenChange={setShowAdminPanel}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Административная панель</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="users" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="users">Пользователи</TabsTrigger>
              <TabsTrigger value="tasks">Задания</TabsTrigger>
              <TabsTrigger value="stats">Статистика</TabsTrigger>
            </TabsList>
            <TabsContent value="users" className="mt-4">
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Добавить сотрудника
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        placeholder="Email"
                        value={newUser.email}
                        onChange={(e) =>
                          setNewUser({ ...newUser, email: e.target.value })
                        }
                      />
                      <Input
                        placeholder="Пароль"
                        value={newUser.password}
                        onChange={(e) =>
                          setNewUser({ ...newUser, password: e.target.value })
                        }
                      />
                      <Input
                        placeholder="Имя"
                        value={newUser.name}
                        onChange={(e) =>
                          setNewUser({ ...newUser, name: e.target.value })
                        }
                      />
                      <Input
                        placeholder="Звание"
                        value={newUser.rank}
                        onChange={(e) =>
                          setNewUser({ ...newUser, rank: e.target.value })
                        }
                      />
                      <Select
                        value={newUser.department}
                        onValueChange={(value) =>
                          setNewUser({ ...newUser, department: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Отдел" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map((dept) => (
                            <SelectItem key={dept.id} value={dept.name}>
                              {dept.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button className="col-span-2">
                        Добавить сотрудника
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Список сотрудников
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(users).map(([email, user]) => (
                        <div
                          key={email}
                          className="flex items-center justify-between p-3 bg-slate-50 rounded"
                        >
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-slate-600">
                              {email} - {user.rank}
                            </p>
                            <p className="text-xs text-slate-500">
                              {user.department}
                            </p>
                          </div>
                          <Badge
                            variant={
                              user.isAdmin
                                ? "default"
                                : user.isDepartmentHead
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {user.isAdmin
                              ? "Админ"
                              : user.isDepartmentHead
                                ? "Руководитель"
                                : "Сотрудник"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="tasks" className="mt-4">
              <div className="space-y-4">
                {tasks.map((task) => (
                  <Card key={task.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{task.title}</h4>
                          <p className="text-sm text-slate-600 mt-1">
                            {task.description}
                          </p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge variant="outline">
                              {task.points} баллов
                            </Badge>
                            <Badge
                              variant={
                                task.assignedTo ? "default" : "secondary"
                              }
                            >
                              {task.assignedTo ? "Назначено" : "Доступно"}
                            </Badge>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          Редактировать
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="stats" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-blue-600">
                      {Object.keys(users).length}
                    </div>
                    <p className="text-sm text-slate-600">Всего сотрудников</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-green-600">
                      {tasks.length}
                    </div>
                    <p className="text-sm text-slate-600">Всего заданий</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-purple-600">
                      {departments.length}
                    </div>
                    <p className="text-sm text-slate-600">Отделов</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
