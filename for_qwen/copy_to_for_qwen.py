# Для запуска: python copy_to_for_qwen.py
import os
import shutil
from datetime import datetime

def collect_content_to_for_qwen():
    current_dir = os.getcwd()
    parent_dir = os.path.dirname(current_dir)
    output_file = os.path.join(current_dir, 'content.txt')

    # Создаём папку (на всякий случай)
    os.makedirs(current_dir, exist_ok=True)

    # Проверяем, существует ли старый content.txt
    if os.path.exists(output_file):
        # Используем mtime — время последнего изменения файла
        mod_time = os.path.getmtime(output_file)  # ← вот здесь исправлено!
        mod_dt = datetime.fromtimestamp(mod_time)
        timestamp = mod_dt.strftime("%Y_%m_%d_%H_%M_%S")
        backup_name = os.path.join(current_dir, f"content_{timestamp}.txt")
        shutil.move(output_file, backup_name)
        print(f"Старый файл переименован: content.txt → content_{timestamp}.txt")

    # Открываем новый файл для записи
    with open(output_file, 'w', encoding='utf-8') as outfile:
        for item in os.listdir(parent_dir):
            item_path = os.path.join(parent_dir, item)

            if not os.path.isfile(item_path):
                continue

            header = f"Содержимое файла {item}:"
            outfile.write(header + '\n')
            outfile.write('-' * 50 + '\n')

            try:
                with open(item_path, 'r', encoding='utf-8') as infile:
                    content = infile.read()
                    outfile.write(content + '\n\n')
            except UnicodeDecodeError:
                error_msg = f"[Файл {item} не является текстовым. Пропущен.]\n\n"
                outfile.write(error_msg)
            except Exception as e:
                error_msg = f"[Ошибка при чтении {item}: {str(e)}]\n\n"
                outfile.write(error_msg)

    print(f"Готово! Все содержимое записано в {output_file}")

if __name__ == "__main__":
    collect_content_to_for_qwen()