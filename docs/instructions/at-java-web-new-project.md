---
layout: instructions
title: Инструкции по настройке
---


# Инструкция по настройке нового проекта для автотестирования в IntelliJ IDEA

## Исходный файл build.gradle
После создания нового проекта у вас должен автоматически создаться файл build.gradle:
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

## Что надо добавить в файл build.gradle

Для подключения библиотек Selenide (и через зависимости подключится библиотека Selenium) в раздел dependencies:  
```groovy testImplementation 'com.codeborne:selenide:7.7.3'  ```

Для того, чтобы избавиться от предупреждения об отсутсвии модуля логирования в раздел dependencies: 
```groovy testImplementation 'org.slf4j:slf4j-simple:2.0.12'  ```

Для того, чтобы корректно работать с кириллицей в конце файла:  
```groovy 
tasks.withType(JavaCompile).configureEach {
    options.encoding = 'UTF-8'
}
```

## Итоговый вид файла build.gradle

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
