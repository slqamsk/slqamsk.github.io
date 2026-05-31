---
layout: instructions
title: Инструкции по установке и настройке инструментов автотестирования
---

# Инструкции по установке и настройке инструментов автотестирования

## Установка IntelliJ IDEA
1. Скачайте дистрибутив со страницы: https://www.jetbrains.com/idea/download/?section=windows  
Либо по прямой ссылке (актульная на май 2026 версия): https://download-cdn.jetbrains.com/idea/idea-2026.1.2.exe  

2. Во время установки на экране "Installation Options" отметьте все чек-боксы, все остальные параметры не меняйте.

3. После установки не выбирайте пункт "Start a Free Trial" - тогда вам выдадут Enterprise фичи, но что станет с приложением через месяц - неизвестно. А нам в рамках нашего учебного курса они не нужны.

## Создание нового проекта
При создании нового проекта обратите внимание на:
1. Name - имя проекта - лучше использовать только маленькие латинские буквы и дефисы (цифры - допустимы), первый символ - латинская буква. Например, "start-project", "my-first-project", "my-project-v01".
2. Location - расположение проекта. Если у вас в имени пользователя Windows есть кириллица, то поменяйте расположение на, например, "C:\IdeaProjects\". Если имя пользоватля Windows только латинские буквы, можно оставить как есть.
3. Build System - выбирайте Gradle
4. JDK - Java Development Kit - список установленных на ваш компьютер JDK. \
Если у вас уже установлена ваша любимая версия Java - выбирайте её. \
Если у вас не установлена Java, то выбирайте "Download JDK". \
В открывшемся окне выберите версию 25 (не выбирайте 26-ю версию, она не LTE), вендора "Eclipce Temurin". \
Если в вашем имени пользователя Windows есть кириллица, расположение поменяйте.
5. Gradle DSL - выбирайте Groovy
6. Уберите галочку "Add sample code" - нам образец кода не нужен.
7. В Advanced setting GroupId поменяйте на тот, который принят у вас в компании или просто укажите свои имя и фамилию через точку, у меня, например, "sergey.slesarev".
8. Остальные настройки - оставьте как есть.  

## Настройка нового проекта

### Исходный файл build.gradle
После создания проекта автоматически создаётся файл сборки Gradle — build.gradle:

```groovy
plugins {
    id 'java'
}

group = 'sergey.slesarev'
version = '1.0-SNAPSHOT'

repositories {
    mavenCentral()
}

dependencies {
    testImplementation platform('org.junit:junit-bom:6.0.0')
    testImplementation 'org.junit.jupiter:junit-jupiter'
    testRuntimeOnly 'org.junit.platform:junit-platform-launcher'
}

test {
    useJUnitPlatform()
}
```

### Что надо добавить в файл build.gradle

Для подключения библиотек Selenide (и через зависимости подключится библиотека Selenium) в раздел dependencies:  
```groovy
testImplementation 'com.codeborne:selenide:7.7.3'
```

Для того, чтобы избавиться от предупреждения об отсутсвии модуля логирования в раздел dependencies: 
```groovy 
testImplementation 'org.slf4j:slf4j-simple:2.0.12'
```

Для того, чтобы корректно работать с кириллицей в конце файла:  
```groovy 
tasks.withType(JavaCompile).configureEach {
    options.encoding = 'UTF-8'
}
```

### Итоговый вид файла build.gradle

```groovy
plugins {
    id 'java'
}

group = 'sergey.slesarev'
version = '1.0-SNAPSHOT'

repositories {
    mavenCentral()
}

dependencies {
    testImplementation platform('org.junit:junit-bom:6.0.0')
    testImplementation 'org.junit.jupiter:junit-jupiter'
    testRuntimeOnly 'org.junit.platform:junit-platform-launcher'
// Добавляем для работы с библиотекой selenide:
    testImplementation 'com.codeborne:selenide:7.7.3'
// Добавляем для устранения предупреждений:    
    testImplementation 'org.slf4j:slf4j-simple:2.0.12'
}

test {
    useJUnitPlatform()
}

// Добавляем для корректной работы с кириллицей:
tasks.withType(JavaCompile).configureEach {
    options.encoding = 'UTF-8'
}
```
