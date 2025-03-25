class SkillMatcher:
    """Class for matching employee skills to project requirements."""

    @staticmethod
    def calculate_skill_match(employee_skills, required_skills):
        """
        Calculate the skill match percentage between employee skills and required skills.

        Args:
            employee_skills: List of employee skills.
            required_skills: List of required skills.

        Returns:
            tuple: (match_percentage, matched_skills, missing_skills)
        """
        if not employee_skills or not required_skills:
            return 0.0, [], required_skills

        # Convert all skills to lowercase for case-insensitive matching
        employee_skills_lower = [skill.lower() for skill in employee_skills]
        required_skills_lower = [skill.lower() for skill in required_skills]

        # Find matched and missing skills
        matched_skills = []
        for req_skill in required_skills:
            req_skill_lower = req_skill.lower()

            # Check for exact match
            if req_skill_lower in employee_skills_lower:
                matched_skills.append(req_skill)
                continue

            # Check for partial match (e.g., "Python" matches "Python 3")
            found_partial = False
            for emp_skill in employee_skills:
                emp_skill_lower = emp_skill.lower()
                if req_skill_lower in emp_skill_lower or emp_skill_lower in req_skill_lower:
                    matched_skills.append(req_skill)
                    found_partial = True
                    break

            # If no match found, check for synonyms/related skills
            if not found_partial:
                for emp_skill, req_skill_pair in SkillMatcher.get_related_skills():
                    if (req_skill_lower == req_skill_pair.lower() and
                            emp_skill.lower() in employee_skills_lower):
                        matched_skills.append(req_skill)
                        break

        # Calculate missing skills
        missing_skills = [skill for skill in required_skills if skill not in matched_skills]

        # Calculate match percentage
        match_percentage = len(matched_skills) / len(required_skills) if required_skills else 0.0

        return match_percentage, matched_skills, missing_skills

    @staticmethod
    def calculate_skill_similarity(employee_skills, required_skills):
        """
        Calculate similarity between employee skills and required skills.
        Shows match even with partial skill coverage.

        Args:
            employee_skills: List of employee skills
            required_skills: List of skills required for the role

        Returns:
            float: Match score between 0 and 1
        """
        if not employee_skills or not required_skills:
            return 0.0

        # Clean up inputs
        if isinstance(required_skills, str):
            required_skills = [s.strip() for s in required_skills.split(',') if s.strip()]

        # Convert all to lowercase
        employee_skills_lower = [s.lower() for s in employee_skills]
        required_skills_lower = [s.lower() for s in required_skills]

        # Count matches (including partial matches)
        matches = 0
        for req_skill in required_skills_lower:
            # Check for exact or partial match
            for emp_skill in employee_skills_lower:
                if req_skill in emp_skill or emp_skill in req_skill:
                    matches += 1
                    break

            # Check related skills
            for rel_pair in SkillMatcher.get_related_skills():
                rel_skill_1_lower = rel_pair[0].lower()
                rel_skill_2_lower = rel_pair[1].lower()

                # Check if employee has a related skill that matches the requirement
                if ((rel_skill_1_lower == req_skill and
                     rel_skill_2_lower in employee_skills_lower) or
                        (rel_skill_2_lower == req_skill and
                         rel_skill_1_lower in employee_skills_lower)):
                    matches += 1
                    break

        # Return proportion of skills matched (not requiring all skills)
        # Using min 0.1 ensures employees with at least one match get shown
        return max(0.1, matches / len(required_skills)) if matches > 0 else 0.0

    @staticmethod
    def get_related_skills():
        """
        Returns pairs of related skills/synonyms.

        Returns:
            list: List of tuples containing related skills.
        """
        return [
            ("JavaScript", "JS"),
            ("JavaScript", "TypeScript"),
            ("React", "React.js"),
            ("React", "ReactJS"),
            ("Angular", "AngularJS"),
            ("Vue", "Vue.js"),
            ("Node", "Node.js"),
            ("Python", "Python 3"),
            ("C#", "C Sharp"),
            ("C++", "CPP"),
            ("PostgreSQL", "Postgres"),
            ("MySQL", "SQL"),
            ("MongoDB", "NoSQL"),
            ("Git", "GitHub"),
            ("AWS", "Amazon Web Services"),
            ("Azure", "Microsoft Azure"),
            ("HTML", "HTML5"),
            ("CSS", "CSS3"),
            ("PHP", "Laravel"),
            ("Ruby", "Rails"),
            ("Ruby", "Ruby on Rails"),
            ("Java", "Spring"),
            ("Java", "SpringBoot"),
            ("Java", "J2EE"),
            (".NET", "C#"),
            (".NET", "ASP.NET"),
            ("Docker", "Containerization"),
            ("Kubernetes", "K8s"),
            ("CI/CD", "Jenkins"),
            ("CI/CD", "GitLab CI"),
            ("CI/CD", "GitHub Actions"),
            ("Machine Learning", "ML"),
            ("Artificial Intelligence", "AI"),
            ("TensorFlow", "Machine Learning"),
            ("PyTorch", "Machine Learning"),
            ("Data Science", "Data Analysis"),
            ("Big Data", "Hadoop"),
            ("Big Data", "Spark"),
            ("DevOps", "SRE"),
            ("Frontend", "UI Development"),
            ("Backend", "API Development"),
            ("Full Stack", "Frontend"),
            ("Full Stack", "Backend"),
            ("REST", "RESTful API"),
            ("GraphQL", "API"),
            ("Mobile", "iOS"),
            ("Mobile", "Android"),
            ("React Native", "Mobile"),
            ("Flutter", "Mobile"),
            ("UX", "User Experience"),
            ("UI", "User Interface"),
            ("Agile", "Scrum"),
            ("Agile", "Kanban"),
            ("Project Management", "Agile"),
            ("Test Automation", "QA"),
            ("Testing", "QA"),
            ("Unit Testing", "Testing"),
            ("Selenium", "Test Automation"),
            ("Jest", "Unit Testing"),
            ("Mocha", "Unit Testing"),
            ("Linux", "Unix"),
            ("Shell Scripting", "Bash"),
            ("Cloud", "AWS"),
            ("Cloud", "Azure"),
            ("Cloud", "GCP"),
            ("Google Cloud", "GCP"),
            ("Microservices", "Service Oriented Architecture"),
            ("SOA", "Service Oriented Architecture"),
            ("Serverless", "FaaS"),
            ("Serverless", "Lambda"),
            ("Serverless", "Cloud Functions"),
            ("Authentication", "OAuth"),
            ("Authentication", "JWT"),
            ("Security", "InfoSec"),
            ("Cybersecurity", "Security"),
            ("Blockchain", "Smart Contracts"),
            ("Blockchain", "Ethereum"),
            ("Blockchain", "Web3"),
            ("VR", "Virtual Reality"),
            ("AR", "Augmented Reality"),
            ("IoT", "Internet of Things"),
            ("Embedded Systems", "IoT"),
            ("Game Development", "Unity"),
            ("Game Development", "Unreal Engine"),
            ("Business Intelligence", "BI"),
            ("Tableau", "Data Visualization"),
            ("Power BI", "Data Visualization"),
            ("Excel", "Spreadsheet"),
            ("VBA", "Excel"),
            ("SEO", "Search Engine Optimization"),
            ("Digital Marketing", "SEO"),
            ("Content Management", "CMS"),
            ("WordPress", "CMS"),
            ("Drupal", "CMS"),
            ("E-commerce", "Shopify"),
            ("E-commerce", "WooCommerce"),
            ("Payment Integration", "Stripe"),
            ("Payment Integration", "PayPal"),
            ("Communication", "Teamwork"),
            ("Problem Solving", "Analytical Skills"),
            ("Leadership", "Team Management"),
            ("Critical Thinking", "Problem Solving"),
            ("Time Management", "Organization")
        ]

    @staticmethod
    def get_skill_gap(employee_skills, required_skills):
        """
        Get the skill gap between employee skills and required skills.

        Args:
            employee_skills: List of employee skills.
            required_skills: List of required skills.

        Returns:
            list: List of missing skills.
        """
        _, _, missing_skills = SkillMatcher.calculate_skill_match(employee_skills, required_skills)
        return missing_skills