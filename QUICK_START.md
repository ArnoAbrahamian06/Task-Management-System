# 🚀 QUICK START: Запуск и Тестирование API за 5 минут

## 1️⃣ СОБРАТЬ ПРИЛОЖЕНИЕ (2 минуты)

```bash
cd D:\JavaProjects\TMS
mvn clean package -DskipTests
```

**Результат:** Файл `target/task-management-system-0.0.1-SNAPSHOT.jar`

---

## 2️⃣ ЗАПУСТИТЬ ПРИЛОЖЕНИЕ (1 минута)

```bash
java -jar target/task-management-system-0.0.1-SNAPSHOT.jar
```

**Ожидаемый результат:**
```
Started Application in 15.234 seconds (JVM running for 15.892)
Tomcat started on port(s): 8080 (http)
```

---

## 3️⃣ ОТКРЫТЬ SWAGGER (1 клик)

```
http://localhost:8080/swagger-ui.html
```

или

```
http://localhost:8080/api-docs (JSON документация)
```

---

## 4️⃣ ПРОТЕСТИРОВАТЬ 5 ОСНОВНЫХ ENDPOINTS (1 минута)

### **Тест #1: Регистрация**
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

**Ответ должен содержать JWT токен!**

---

### **Тест #2: Логин**
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Скопируйте JWT токен! Пример:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### **Тест #3: Профиль (требует токен)**
```bash
curl -X GET http://localhost:8080/api/users/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### **Тест #4: Создать проект (требует токен)**
```bash
curl -X POST http://localhost:8080/api/projects \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My First Project",
    "description": "Test project",
    "taskCount": 0,
    "completedCount": 0
  }'
```

---

### **Тест #5: Мои проекты (требует токен)**
```bash
curl -X GET http://localhost:8080/api/projects/my \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 📋 ИСПОЛЬЗУЕМЫЕ ПОРТЫ И URLS

| Сервис | URL | Статус |
|--------|-----|--------|
| API | http://localhost:8080 | ✅ |
| Swagger UI | http://localhost:8080/swagger-ui.html | ✅ |
| OpenAPI JSON | http://localhost:8080/api-docs | ✅ |
| База данных | 84.54.30.160:5432 | ✅ |

---

## 🔑 ВАЖНЫЕ ТЕСТОВЫЕ ДАННЫЕ

```
Database:
  URL: jdbc:postgresql://84.54.30.160:5432/test_db
  User: test_user
  Password: 123_psw

API Keys:
  JWT Secret: ARNOABRAMIANIGORFURSOVLIZALAGEREVA
  Token Expiration: 24 часа

Default Admin (если нужен):
  Email: admin@example.com
  Password: admin123
  Role: ADMIN
```

---

## ⚠️ ЕСЛИ ВОЗНИКАЮТ ПРОБЛЕМЫ

### **Ошибка: Connection refused на порту 8080**
- ❌ Приложение не запущено
- ✅ Решение: Убедитесь что нет других приложений на порту 8080

### **Ошибка: PostgreSQL connection failed**
- ❌ БД не доступна
- ✅ Решение: Проверьте интернет соединение и адрес БД

### **Ошибка: JWT validation failed**
- ❌ Токен неправильный или истек
- ✅ Решение: Получите новый токен через /api/auth/login

### **Ошибка: 403 Forbidden**
- ❌ Нет прав доступа
- ✅ Решение: Проверьте роль пользователя (USER vs ADMIN)

---

## 🎯 СЛЕДУЮЩИЕ ШАГИ

1. **✅ Завершено:** Тестирование API
2. **➡️ Дальше:** Интеграция фронтенда с реальным API
   - Обновить `front/lib/api.ts`
   - Заменить mock данные на реальные вызовы
   - Добавить JWT токен в заголовки

3. **➡️ Затем:** Настройка фронтенда
   - Установить переменные окружения
   - Настроить CORS
   - Протестировать взаимодействие

4. **➡️ Наконец:** Готовность к продакшену
   - Настроить HTTPS
   - Добавить rate limiting
   - Включить логирование и мониторинг

---

## 📞 ПОЛЕЗНЫЕ КОМАНДЫ

```bash
# Собрать приложение
mvn clean package -DskipTests

# Запустить приложение
java -jar target/task-management-system-0.0.1-SNAPSHOT.jar

# Запустить с профилем
java -jar target/task-management-system-0.0.1-SNAPSHOT.jar --spring.profiles.active=dev

# Остановить приложение
# Нажмите Ctrl+C в терминале

# Проверить логи
# Они выводятся в консоль при запуске
```

---

## 🎉 ВСЁ ГОТОВО!

**Приложение запущено и готово к тестированию.**

Теперь вы можете:
1. Протестировать все endpoints через Swagger
2. Интегрировать фронтенд с реальным API
3. Развернуть на production сервере

**Удачи в разработке! 🚀**

