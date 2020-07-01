const express = require('express');
const cors = require('cors')
const { request } = require('express');
const { uuid, isUuid } = require('uuidv4');

const app = express();

//apenas para ambiente de desenvolvimento
app.use(cors());

app.use(express.json());

//grava na memória
const projects = [];

//Middleware que dispara de forma automática em todas as requisições que mostra
//qual rota está sendo chamada
function logRequests(request, response, next) {
	const { method, url } = request;

	const logLabel = `[${method.toUpperCase()}] ${url}`;

	console.log(logLabel);

	return next(); //próximo Middleware
}

function validateProjectId(request, response, next) {
	const { id } = request.params;

	if(!isUuid(id)){
		return response.status(400).json({ error: "Invalid project ID." })
	}

	return next();
}

app.use(logRequests);

//roda o middleware apenas nas rotas que tem id
app.use('/projects/:id', validateProjectId)

app.get('/projects', (request, response) => {
	const { title } = request.query;

	const results = title
		//se for preenchido pelo usuário ele vai para projects.filter
		//que verifica se o texto pesquisado pelo usuário está contido
		// no título
		? projects.filter(project => project.title.includes(title))
		//se o usuário mandar vazio ele retorna os projects
		: projects;

	return response.json(results);
});

app.post('/projects', (request, response) => {
	const { title, owner } = request.body;

	const project = { id: uuid(), title, owner };

	projects.push(project);

	return response.json(project);
});

app.put('/projects/:id', (request, response) => {
	const { id } = request.params;
	const { title, owner } = request.body;

	//busca o id que foi solicitado na const
	//const project = projects.find(project => project.id === id);

	//busca a posição dentro do vetor projects - melhor forma
	//busca o projeto no array
	const projectIndex = projects.findIndex(project => project.id === id);
	if(projectIndex < 0) {
		return response.status(400).json({ error: 'Project not found.' })
	}

	const project = {
		id,
		title,
		owner,
	}

	projects[projectIndex] = project;

	return response.json(project);
});

app.delete('/projects/:id',(request, response) => {
	const { id } = request.params;

	//busca o projeto no array
	const projectIndex = projects.findIndex(project => project.id === id);
	if(projectIndex < 0) {
		return response.status(400).json({ error: 'Project not found.' })
	}

	projects.splice(projectIndex, 1);

	return response.status(204).send();
});

app.listen(3333, () => {
	console.log('🚀Back-end started')
	//abrir emojis é a tecla windows + .
})