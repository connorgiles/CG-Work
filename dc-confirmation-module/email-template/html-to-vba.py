def nonblank_lines(f):
    for l in f:
        line = l.rstrip()
        if line:
            yield line

def replace_quotations(l):
	return l.replace('"',"'")

f = open('email-template.html', 'r')

text = ''

for line in nonblank_lines(f):
	if line:
		text = text + 'body = body & "'+replace_quotations(line)+'"\n'

print text

c = open('email-compressed.html', 'w')

c.write(text)