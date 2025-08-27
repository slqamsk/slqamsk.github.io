# copy_to_for_qwen_v02.py
# Для запуска: python copy_to_for_qwen_v02.py C:\Users\Me\MyProject
import os
import shutil
from datetime import datetime
import sys

def collect_content_to_for_qwen(target_dir):
    # Проверяем, существует ли указанная директория
    if not os.path.isdir(target_dir):
        print(f"Ошибка: Путь '{target_dir}' не является папкой или не существует.")
        return

    # Получаем имя папки (последнюю часть пути)
    folder_name = os.path.basename(os.path.normpath(target_dir))
    current_dir = os.getcwd()
    output_file = os.path.join(current_dir, f'content_{folder_name}.txt')

    # Создаём текущую папку (на всякий случай)
    os.makedirs(current_dir, exist_ok=True)

    # Если файл уже существует — бэкапим с меткой времени
    if os.path.exists(output_file):
        mod_time = os.path.getmtime(output_file)
        mod_dt = datetime.fromtimestamp(mod_time)
        timestamp = mod_dt.strftime("%Y_%m_%d_%H_%M_%S")
        backup_name = os.path.join(current_dir, f"content_{folder_name}_{timestamp}.txt")
        shutil.move(output_file, backup_name)
        print(f"Старый файл переименован: {output_file} → {backup_name}")

    # Открываем файл для записи
    with open(output_file, 'w', encoding='utf-8') as outfile:
        # Обход всех файлов в целевой директории и поддиректориях
        for root, dirs, files in os.walk(target_dir):
            for file in files:
                file_path = os.path.join(root, file)

                # Формируем относительный путь от целевой директории
                rel_path = os.path.relpath(file_path, target_dir)
                # Формируем путь с обратными слешами (Windows-style)
                display_path = f"{folder_name}\\{rel_path.replace(os.sep, '\\')}"

                header = f"Содержимое файла: {display_path}"
                outfile.write(header + '\n')
                outfile.write('-' * 50 + '\n')

                try:
                    with open(file_path, 'r', encoding='utf-8') as infile:
                        content = infile.read()
                        outfile.write(content + '\n\n')
                except UnicodeDecodeError:
                    error_msg = f"[Файл {display_path} не является текстовым. Пропущен.]\n\n"
                    outfile.write(error_msg)
                except Exception as e:
                    error_msg = f"[Ошибка при чтении {display_path}: {str(e)}]\n\n"
                    outfile.write(error_msg)

    print(f"Готово! Все содержимое записано в {output_file}")

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Использование: python copy_to_for_qwen.py <путь_к_папке>")
        sys.exit(1)

    target_directory = sys.argv[1]
    collect_content_to_for_qwen(target_directory)