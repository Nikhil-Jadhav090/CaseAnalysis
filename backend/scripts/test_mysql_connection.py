import pymysql

print('pymysql', pymysql.__version__)
conn = pymysql.connect(host='localhost', user='root', password='Nikhil@0916', db='CaseAnalysis', port=3306)
cur = conn.cursor()
cur.execute('CREATE TABLE IF NOT EXISTS ci_connection_test (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(64))')
cur.execute("INSERT INTO ci_connection_test (name) VALUES ('connected')")
conn.commit()
cur.execute('SELECT id, name FROM ci_connection_test ORDER BY id DESC LIMIT 1')
row = cur.fetchone()
print('row:', row)
conn.close()
