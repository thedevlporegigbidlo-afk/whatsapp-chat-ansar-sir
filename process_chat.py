import sys
import re
import json
from datetime import datetime

with open('WhatsApp Chat with Ansar Sir.txt', 'r', encoding='utf-8') as f:
    lines = [l.rstrip('\r\n') for l in f.readlines()]

msg_pattern = re.compile(r'^(\d{1,2}/\d{1,2}/\d{2,4}),\s*(\d{1,2}:\d{2}[\s\u202f]*(?:[ap]m|[AP]M)?)\s*-\s*([^:]+):\s*(.*)$')
system_pattern = re.compile(r'^(\d{1,2}/\d{1,2}/\d{2,4}),\s*(\d{1,2}:\d{2}[\s\u202f]*(?:[ap]m|[AP]M)?)\s*-\s*(.*)$')

month_names = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
full_months = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

def parse_date_label(d_str):
    parts = d_str.split('/')
    if len(parts) == 3:
        day, month, year = int(parts[0]), int(parts[1]), int(parts[2])
        if year < 100:
            year += 2000
        dt = datetime(year, month, day)
        dow = dt.strftime('%A')
        short_label = f"{day} {month_names[month]} {year}"
        full_label = f"{dow}, {day} {full_months[month]} {year}"
        iso = f"{year:04d}-{month:02d}-{day:02d}"
        return short_label, full_label, iso
    return d_str, d_str, d_str

items = []
md_count = 0
piyari_count = 0
deleted_count = 0
dates_order = []
dates_info = {}

# Love terms tracking
love_terms = {
    'jaaneman': 0,
    'meri jaan': 0,
    'darling': 0,
    'baby': 0,
    'khana': 0,
    'photo': 0,
    'call': 0
}

for idx, line in enumerate(lines):
    m = msg_pattern.match(line)
    if m:
        date_str, time_str, sender, text = m.groups()
        time_clean = time_str.replace('\u202f', ' ').strip()

        if sender == 'Ansar Sir':
            sender_name = 'Piyari'
            is_me = False
            piyari_count += 1
        elif sender == 'mdtabarakpiyari':
            sender_name = 'Tabarak'
            is_me = True
            md_count += 1
        else:
            sender_name = sender
            is_me = False

        is_deleted = (text == 'You deleted this message' or text == 'This message was deleted')
        if is_deleted:
            deleted_count += 1

        lower_text = text.lower()
        for k in love_terms:
            if k in lower_text:
                love_terms[k] += 1

        if date_str not in dates_info:
            dates_order.append(date_str)
            short_lbl, full_lbl, iso = parse_date_label(date_str)
            dates_info[date_str] = {
                'raw': date_str,
                'short': short_lbl,
                'full': full_lbl,
                'iso': iso,
                'count': 0
            }
        dates_info[date_str]['count'] += 1

        items.append({
            'id': idx + 1,
            'type': 'message',
            'date': date_str,
            'time': time_clean,
            'sender': sender_name,
            'is_me': is_me,
            'text': text,
            'is_deleted': is_deleted
        })
    else:
        sm = system_pattern.match(line)
        if sm:
            date_str, time_str, text = sm.groups()
            time_clean = time_str.replace('\u202f', ' ').strip()
            text_clean = text.replace('Ansar Sir', 'Piyari')
            if date_str not in dates_info:
                dates_order.append(date_str)
                short_lbl, full_lbl, iso = parse_date_label(date_str)
                dates_info[date_str] = {
                    'raw': date_str,
                    'short': short_lbl,
                    'full': full_lbl,
                    'iso': iso,
                    'count': 0
                }
            items.append({
                'id': idx + 1,
                'type': 'system',
                'date': date_str,
                'time': time_clean,
                'text': text_clean
            })

chat_data = {
    'contact': {
        'name': 'Piyari',
        'title': 'Piyari 💕',
        'avatar': 'assets/piyari.png',
        'status': 'online',
        'subtitle': 'online • in your heart ✨',
        'phone': '+91 91234 56789',
        'about': 'Always smiling with you 🌸',
    },
    'me': {
        'name': 'Tabarak',
        'title': 'Tabarak 👑',
        'avatar': 'assets/tabarak.png',
        'phone': '+91 98765 43210'
    },
    'stats': {
        'totalItems': len(items),
        'totalMessages': md_count + piyari_count,
        'mdMessages': md_count,
        'piyariMessages': piyari_count,
        'totalDates': len(dates_order),
        'deletedCount': deleted_count,
        'startDate': dates_info[dates_order[0]]['short'],
        'endDate': dates_info[dates_order[-1]]['short'],
        'loveTerms': love_terms
    },
    'dates': [dates_info[d] for d in dates_order],
    'items': items
}

with open('chat_data.js', 'w', encoding='utf-8') as f:
    f.write('window.CHAT_DATA = ' + json.dumps(chat_data, ensure_ascii=False, indent=2) + ';')

print(f"Successfully processed {len(items)} items ({md_count} from Tabarak, {piyari_count} from Piyari) across {len(dates_order)} dates.")
